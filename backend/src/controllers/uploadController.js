import prisma from '../utils/prisma.js';
import fs from 'fs';
import csv from 'csv-parser';
import xlsx from 'xlsx';

const pabrikMap = {
  'D008': 1, 'D009': 1, 'P1A': 1, 'PABRIK 1A': 1, 'PABRIK1A': 1, '1A': 1,
  'D002': 2, 'P2': 2, 'PABRIK 2': 2, 'PABRIK2': 2,
  'D003': 3, 'P3': 3, 'PABRIK 3': 3, 'PABRIK3': 3,
  'D004': 4, 'P4': 4, 'PABRIK 4': 4, 'PABRIK4': 4,
  'D005': 5, 'P5': 5, 'PABRIK 5': 5, 'PABRIK5': 5,
  'D006': 6, 'D001': 6, 'P6': 6, 'PABRIK 6': 6, 'PABRIK6': 6,
  'D007': 7, 'P7': 7, 'PABRIK 7': 7, 'PABRIK7': 7,
};

const getRowValue = (row, candidates) => {
  if (!row) return undefined;
  const keys = Object.keys(row);
  for (const candidate of candidates) {
    const normCandidate = candidate.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const key of keys) {
      const normKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (normKey === normCandidate) {
        const val = row[key];
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          return val;
        }
      }
    }
  }
  return undefined;
};

const parseDate = (val) => {
  if (!val) return null;

  if (val instanceof Date) {
    if (isNaN(val.getTime())) return null;
    // Extract local year, month, date created by SheetJS
    const y = val.getFullYear();
    const m = val.getMonth();
    const d = val.getDate();
    return new Date(Date.UTC(y, m, d, 12, 0, 0));
  }

  if (typeof val === 'number') {
    const jsDate = new Date(Math.round((val - 25569) * 86400 * 1000));
    if (isNaN(jsDate.getTime())) return null;
    const y = jsDate.getUTCFullYear();
    const m = jsDate.getUTCMonth();
    const d = jsDate.getUTCDate();
    return new Date(Date.UTC(y, m, d, 12, 0, 0));
  }

  if (typeof val !== 'string') return null;
  const str = val.trim();
  if (!str) return null;

  // Handles DD.MM.YYYY, DD-MM-YYYY, DD/MM/YYYY, YYYY-MM-DD, YYYY.MM.DD
  const parts = str.split(/[.\-/]/);
  if (parts.length >= 3) {
    let day, month, year;
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      day = parseInt(parts[2], 10);
    } else {
      // DD.MM.YYYY
      day = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      year = parseInt(parts[2], 10);
    }
    if (!isNaN(day) && !isNaN(month) && !isNaN(year) && year > 1990 && month >= 0 && month < 12) {
      return new Date(Date.UTC(year, month, day, 12, 0, 0));
    }
  }

  const jsDate = new Date(str);
  if (isNaN(jsDate.getTime())) return null;
  return new Date(Date.UTC(jsDate.getFullYear(), jsDate.getMonth(), jsDate.getDate(), 12, 0, 0));
};

const getTipePM = (order) => {
  if (!order) return 'PM10';
  const strOrder = String(order).trim();
  if (strOrder.startsWith('10000')) return 'PM01';
  if (strOrder.startsWith('200')) return 'PM02';
  if (strOrder.startsWith('300')) return 'PM03';
  if (strOrder.startsWith('400')) return 'PM04';
  if (strOrder.startsWith('500')) return 'PM05';
  if (strOrder.startsWith('600')) return 'PM06';
  if (strOrder.startsWith('700')) return 'PM07';
  if (strOrder.startsWith('800')) return 'PM08';
  if (strOrder.startsWith('911')) return 'PM09';
  return 'PM10';
};

const parseFile = (filePath, originalName) => {
  return new Promise((resolve, reject) => {
    const isExcel = originalName.match(/\.(xlsx|xls)$/i);
    if (isExcel) {
      try {
        const workbook = xlsx.readFile(filePath, { cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const rawResults = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });
        
        const results = rawResults.map(row => {
          const cleanRow = {};
          for (const key in row) {
            const cleanKey = key.trim().replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/, '').replace(/^"|"$/g, '');
            cleanRow[cleanKey] = row[key];
          }
          return cleanRow;
        });
        resolve(results);
      } catch (err) {
        reject(err);
      }
    } else {
      const results = [];
      const fileBuffer = fs.readFileSync(filePath);
      const firstLine = fileBuffer.toString('utf8').split('\n')[0] || '';
      const separator = firstLine.includes('\t') ? '\t' : (firstLine.includes(';') ? ';' : ',');

      fs.createReadStream(filePath)
        .pipe(csv({ 
          separator,
          mapHeaders: ({ header }) => header.trim().replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/, '').replace(/^"|"$/g, '')
        }))
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (err) => reject(err));
    }
  });
};

export const uploadWorkOrders = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  let insertedCount = 0;
  let updatedCount = 0;
  let failCount = 0;

  try {
    const results = await parseFile(req.file.path, req.file.originalname);
    const BATCH_SIZE = 500; // Bulk: satu query untuk 500 baris

    for (let i = 0; i < results.length; i += BATCH_SIZE) {
      const batch = results.slice(i, i + BATCH_SIZE);

      // Siapkan baris valid dalam batch ini
      const validRows = [];
      for (const row of batch) {
        const orderRaw = getRowValue(row, ['Order', 'Work Order', 'WorkOrder', 'Order No', 'Order Number', 'Pesanan', 'No WO', 'WO']);
        const order = orderRaw ? String(orderRaw).trim() : `WO-AUTO-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

        let opActivityRaw = getRowValue(row, ['Operation/Activity', 'Operation Activity', 'Activity', 'Op', 'Operation', 'Operasi']);
        let opActivity = '';
        if (opActivityRaw !== undefined && opActivityRaw !== null && String(opActivityRaw).trim() !== '') {
          opActivity = typeof opActivityRaw === 'number' ? String(opActivityRaw).padStart(4, '0') : String(opActivityRaw).trim();
        } else {
          opActivity = `AUTO-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        }

        const plantCode = getRowValue(row, ['Maintenance plant', 'MaintenancePlant', 'Plant', 'Pabrik', 'Plnt']) || 'D008';
        const pabrik_id = pabrikMap[plantCode] || 1;

        let statusRaw = getRowValue(row, ['Oper. System Status', 'Oper System Status', 'Oper.System Status', 'System status', 'System Status', 'Status', 'Status Sistem']) || '';
        let status = String(statusRaw).trim();
        if (!status) status = 'CRTD';

        const rawDate = getRowValue(row, ['Notification Date', 'NotificationDate', 'Created on', 'Created On', 'Basic start date', 'Basic Start Date', 'Entered on', 'Entered On', 'Date', 'Tanggal']);
        const descVal = getRowValue(row, ['Operation short text', 'Operation Short Text', 'Description', 'Short text', 'Text', 'Deskripsi']);
        const workCenterVal = getRowValue(row, ['Operation WorkCenter', 'Operation Work Center', 'OperationWorkCenter', 'Work Center', 'WorkCenter', 'Main Work Center', 'Main WorkCenter', 'Main Workcenter', 'Wrk Cntr']);
        const equipVal = getRowValue(row, ['Equipment', 'Equipment No', 'Equipment Number', 'EquipmentNo', 'Peralatan']);
        const tanggal = parseDate(rawDate);

        validRows.push([
          String(order).trim(),
          String(opActivity).trim(),
          descVal ? String(descVal).trim() : '',
          tanggal ? tanggal.toISOString() : null,
          status,
          getTipePM(order),
          pabrik_id,
          workCenterVal ? String(workCenterVal).trim() : null,
          equipVal ? String(equipVal).trim() : null,
        ]);
      }

      if (validRows.length === 0) continue;

      // Dedup dalam batch: cegah error PostgreSQL 'ON CONFLICT DO UPDATE cannot affect row a second time'
      const seenWO = new Map();
      const finalRows = validRows.filter(r => {
        const key = `${r[0]}|${r[1]}`;
        if (seenWO.has(key)) return false;
        seenWO.set(key, true);
        return true;
      });

      try {
        // 1. Fetch existing records to separate Inserts and Updates
        const woKeys = finalRows.map(r => ({ nomor_wo: r[0], operation_activity: r[1] }));
        const existingRecords = await prisma.workOrder.findMany({
          where: { OR: woKeys },
          select: { id: true, nomor_wo: true, operation_activity: true }
        });
        
        const existingMap = new Map();
        for (const record of existingRecords) {
          existingMap.set(`${record.nomor_wo}|${record.operation_activity}`, record.id);
        }

        const toInsert = [];
        const toUpdate = [];

        for (const r of finalRows) {
          const key = `${r[0]}|${r[1]}`;
          const id = existingMap.get(key);
          const data = {
            nomor_wo: r[0],
            operation_activity: r[1],
            description: r[2],
            tanggal_dibuat: r[3] ? new Date(r[3]) : null,
            status: r[4],
            tipe_pm: r[5],
            pabrik_id: r[6],
            work_center: r[7],
            equipment: r[8]
          };
          
          if (id) {
            toUpdate.push({ id, data });
          } else {
            toInsert.push(data);
          }
        }

        // 2. Bulk Insert new records
        if (toInsert.length > 0) {
          const createRes = await prisma.workOrder.createMany({
            data: toInsert,
            skipDuplicates: true
          });
          insertedCount += createRes.count;
        }

        // 3. Bulk Update existing records within a single transaction
        if (toUpdate.length > 0) {
          const updatePromises = toUpdate.map(item => 
            prisma.workOrder.update({
              where: { id: item.id },
              data: item.data
            })
          );
          await prisma.$transaction(updatePromises);
          updatedCount += toUpdate.length;
        }
      } catch (bulkErr) {
        console.error('Bulk WO insert error:', bulkErr.message);
        failCount += finalRows.length;
      }
    }

    console.log(`[WorkOrder Upload] Success: ${insertedCount + updatedCount} (Inserted: ${insertedCount}, Updated/Overwrite: ${updatedCount}), Failed: ${failCount}`);
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.json({
      message: 'Upload completed',
      success: insertedCount + updatedCount,
      inserted: insertedCount,
      updated: updatedCount,
      failed: failCount,
      skipped: 0
    });
  } catch (error) {
    console.error('File parse error:', error);
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Gagal memproses file' });
  }
};


export const uploadRecommendations = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  let insertedCount = 0;
  let updatedCount = 0;
  let failCount = 0;
  let skippedCount = 0; // baris kosong total dari SAP export (header/footer/subtotal)

  try {
    const results = await parseFile(req.file.path, req.file.originalname);
    console.log(`[Rekomendasi Upload] Total rows parsed from file: ${results.length}`);
    const BATCH_SIZE = 500; // Bulk batch — satu query untuk 500 baris

    // === PRE-FILTER: Buang baris kosong/invalid sebelum batch loop ===
    // Ini menghindari iterasi ribuan baris footer SAP yang tidak perlu diproses
    const NOTIF_KEYS_NORM = ['notification', 'notifikasi', 'notificationno', 'notificationnumber',
      'nonotifikasi', 'nonotif', 'notifno', 'notifno', 'notif', 'notificationnumber'];
    
    const validResults = results.filter(row => {
      // Skip baris benar-benar kosong
      const allValues = Object.values(row).map(v => String(v ?? '').trim()).filter(v => v !== '');
      if (allValues.length === 0) { skippedCount++; return false; }

      // Skip baris yang tidak punya Notification valid (angka)
      const keys = Object.keys(row);
      let notifVal = null;
      for (const key of keys) {
        const normKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (NOTIF_KEYS_NORM.includes(normKey)) {
          const v = String(row[key] ?? '').trim();
          if (v !== '' && !isNaN(Number(v))) { notifVal = v; break; }
        }
      }
      if (!notifVal) { skippedCount++; return false; }
      return true;
    });

    console.log(`[Rekomendasi Upload] Valid rows after pre-filter: ${validResults.length} (skipped: ${skippedCount})`);

    for (let i = 0; i < validResults.length; i += BATCH_SIZE) {
      const batch = validResults.slice(i, i + BATCH_SIZE);

      // Siapkan baris valid saja dalam batch ini
      const validRows = [];
      for (const row of batch) {
        const notification = getRowValue(row, [
          'Notification', 'Notifikasi', 'Notification No', 'Notification Number',
          'No Notifikasi', 'No. Notif', 'Notif. No.', 'Notif No', 'Notif',
          'Notification number', 'notification'
        ]);
        if (!notification || String(notification).trim() === '' || isNaN(Number(String(notification).trim()))) {
          continue; // Tidak perlu failCount, sudah di-filter sebelumnya
        }


        const funcLoc = getRowValue(row, ['Functional Loc', 'Functional Location', 'FuncLoc', 'Func Loc', 'Lokasi Fungsional']);
        let pabrik_id = 1;
        if (funcLoc && String(funcLoc).length >= 9) {
          const code = String(funcLoc).substring(5, 9);
          if (pabrikMap[code]) pabrik_id = pabrikMap[code];
        }

        const rawDate = getRowValue(row, [
          'Created on', 'Created On', 'Notification Date', 'Notification date',
          'NotificationDate', 'Date', 'Tanggal', 'Tgl', 'Entry Date'
        ]);
        const createdOnDate = parseDate(rawDate);
        const reportedByVal = getRowValue(row, ['Reported by', 'Reported By', 'Author', 'Pelapor', 'Created by', 'Created By', 'Create By']) || '-';
        const notifType    = getRowValue(row, ['Notification type', 'Notification Type', 'Type', 'Tipe', 'Notif. Type']) || null;
        const orderVal     = getRowValue(row, ['Order', 'Work Order', 'Pesanan']) || null;
        const equipVal     = getRowValue(row, ['Equipment', 'Equipment No', 'Peralatan']) || null;
        const descVal      = getRowValue(row, ['Description', 'Short text', 'Deskripsi', 'Description of functional location']) || null;
        const sysStatus = getRowValue(row, ['System status', 'System Status']);
        const usrStatus = getRowValue(row, ['User Status', 'User status']);
        const fallbackStatus = getRowValue(row, ['Status']);

        // System Status disimpan di kolom `status`, User Status di kolom `user_status` (terpisah)
        const statusVal = (sysStatus ? String(sysStatus).trim() : '') || fallbackStatus || 'Diajukan';
        const userStatusVal = usrStatus ? String(usrStatus).trim() : null;
        const workCenterVal = getRowValue(row, ['Operation WorkCenter', 'Operation Work Center', 'Main Work Center', 'Main WorkCenter', 'Work Center', 'WorkCenter', 'Wrk Cntr']) || null;

        validRows.push([
          String(notification).trim(),  // [0] notification
          notifType,                     // [1] notification_type
          createdOnDate ? createdOnDate.toISOString() : null, // [2] created_on
          orderVal !== null && orderVal !== undefined ? String(orderVal).trim() : null, // [3] order
          equipVal !== null && equipVal !== undefined ? String(equipVal).trim() : null, // [4] equipment
          descVal,                       // [5] description
          reportedByVal,                 // [6] reported_by
          funcLoc || null,               // [7] functional_loc
          pabrik_id,                     // [8] pabrik_id
          statusVal,                     // [9] status (System Status)
          workCenterVal !== null && workCenterVal !== undefined ? String(workCenterVal).trim() : null, // [10] work_center
          userStatusVal                  // [11] user_status (User Status)
        ]);
      }

      if (validRows.length === 0) continue;

      // Dedup dalam batch: cegah error PostgreSQL 'ON CONFLICT DO UPDATE cannot affect row a second time'
      const seenRek = new Map();
      const finalRekRows = validRows.filter(r => {
        const key = `${r[0]}|${r[6]}`;
        if (seenRek.has(key)) return false;
        seenRek.set(key, true);
        return true;
      });

      try {
        // 1. Fetch existing records to separate Inserts and Updates
        const notifs = finalRekRows.map(r => r[0]);
        const existingRecords = await prisma.rekomendasi.findMany({
          where: { notification: { in: notifs } },
          select: { id: true, notification: true, reported_by: true }
        });
        
        const existingMap = new Map();
        for (const record of existingRecords) {
          existingMap.set(`${record.notification}|${record.reported_by}`, record.id);
        }

        const toInsert = [];
        const toUpdate = [];

        for (const r of finalRekRows) {
          const key = `${r[0]}|${r[6]}`;
          const id = existingMap.get(key);
          const data = {
            notification: r[0], notification_type: r[1],
            created_on: r[2] ? new Date(r[2]) : null,
            order: r[3], equipment: r[4], description: r[5],
            reported_by: r[6], functional_loc: r[7],
            pabrik_id: r[8], status: r[9],
            work_center: r[10], user_status: r[11] || null
          };
          
          if (id) {
            toUpdate.push({ id, data });
          } else {
            toInsert.push(data);
          }
        }

        // 2. Bulk Insert new records
        if (toInsert.length > 0) {
          const createRes = await prisma.rekomendasi.createMany({
            data: toInsert,
            skipDuplicates: true
          });
          insertedCount += createRes.count;
        }

        // 3. Bulk Update existing records within a single transaction to save connections
        if (toUpdate.length > 0) {
          const updatePromises = toUpdate.map(item => 
            prisma.rekomendasi.update({
              where: { id: item.id },
              data: item.data
            })
          );
          await prisma.$transaction(updatePromises);
          updatedCount += toUpdate.length;
        }

      } catch (err) {
        console.error('Batch process error:', err.message);
        failCount += finalRekRows.length;
      }
    }

    console.log(`[Rekomendasi Upload] Success: ${insertedCount + updatedCount} (Inserted: ${insertedCount}, Updated/Overwrite: ${updatedCount}), Failed: ${failCount}, Skipped: ${skippedCount}`);
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.json({
      message: 'Upload completed',
      success: insertedCount + updatedCount,
      inserted: insertedCount,
      updated: updatedCount,
      failed: failCount,
      skipped: skippedCount
    });
  } catch (error) {
    console.error('File parse error:', error);
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Gagal memproses file' });
  }
};

export const clearWorkOrders = async (req, res) => {
  try {
    const { date } = req.body;
    if (!date) return res.status(400).json({ error: 'Tanggal diperlukan' });

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await prisma.workOrder.deleteMany({
      where: {
        updatedAt: {
          gte: startOfDay,
          lte: endOfDay,
        }
      }
    });

    res.json({ message: `Berhasil mengosongkan ${result.count} data Work Order`, count: result.count });
  } catch (error) {
    console.error('Clear Work Orders error:', error);
    res.status(500).json({ error: 'Gagal mengosongkan data Work Order' });
  }
};

export const clearRecommendations = async (req, res) => {
  try {
    const { date } = req.body;
    if (!date) return res.status(400).json({ error: 'Tanggal diperlukan' });

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await prisma.rekomendasi.deleteMany({
      where: {
        updatedAt: {
          gte: startOfDay,
          lte: endOfDay,
        }
      }
    });

    res.json({ message: `Berhasil mengosongkan ${result.count} data Rekomendasi`, count: result.count });
  } catch (error) {
    console.error('Clear Recommendations error:', error);
    res.status(500).json({ error: 'Gagal mengosongkan data Rekomendasi' });
  }
};

export const getUploadHistory = async (req, res) => {
  try {
    const { type } = req.query; // 'workorders' or 'recommendations'
    
    let result;
    if (type === 'workorders') {
      result = await prisma.$queryRaw`SELECT DISTINCT DATE("updatedAt") as upload_date FROM "public"."WorkOrder" ORDER BY upload_date DESC`;
    } else {
      result = await prisma.$queryRaw`SELECT DISTINCT DATE("updatedAt") as upload_date FROM "public"."Rekomendasi" ORDER BY upload_date DESC`;
    }
    
    const dates = result
      .filter(row => row.upload_date)
      .map(row => {
        const d = new Date(row.upload_date);
        return d.toISOString().split('T')[0];
      });

    res.json(dates);
  } catch (error) {
    console.error('Get Upload History error:', error);
    res.status(500).json({ error: 'Gagal mengambil riwayat upload' });
  }
};
