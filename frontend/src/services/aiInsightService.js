// Reliability Intelligence & Inspection Analytics Service

export const getAISummary = async (year, month, plant) => {
  return {
    year,
    month,
    plant,
    summary: 'Analisis berbasis bukti data histori notifikasi SAP dan laporan inspeksi keandalan.'
  };
};

export const getRepeatedFailures = async (year, month, plant) => {
  return [
    {
      equipmentNo: '400-P-101A',
      equipmentDescription: 'Ammonia Feed Pump A',
      plantName: 'Pabrik 1A',
      plantCode: 'P1A',
      workCenter: 'D0179',
      recCount: 5,
      confidenceScore: 92,
      dominantRootCause: 'Vibration & Mechanical Seal Degradation',
      recommendedActions: [
        'Lakukan dynamic balancing pada impeller pump',
        'Ganti mechanical seal kit dan periksa alignment shaft',
        'Jadwalkan inspeksi termografi bearing housing'
      ],
      explainability: {
        reasons: [
          'Ditemukan 5 notifikasi rekomendasi berulang dalam kurun waktu 90 hari.',
          'Kata kunci utama pada laporan: "vibrasi tinggi", "kebocoran seal", "misalignment".',
          'Tingkat kekritisan peralatan tinggi (High Criticality Asset).'
        ],
        evidence: {
          recommendationCount: 5,
          m7Count: 2,
          matchedKeywordsCount: 8
        }
      }
    },
    {
      equipmentNo: '400-[#102B]',
      equipmentDescription: 'Boiler Feed Water Pump B',
      plantName: 'Pabrik 2',
      plantCode: 'P2',
      workCenter: 'D0180',
      recCount: 4,
      confidenceScore: 88,
      dominantRootCause: 'Bearing Wear & Lubrication Issue',
      recommendedActions: [
        'Flushing sistem pelumasan dan ganti oli bearing',
        'Analisis minyak pelumas (oil sampling / lab test)',
        'Inspeksi kelonggaran bearing (bearing clearance check)'
      ],
      explainability: {
        reasons: [
          'Ditemukan 4 notifikasi terkait kenaikan suhu bearing.',
          'Kata kunci utama pada laporan: "bearing panas", "pelumas kotor", "vibrasi".',
          'Aset beroperasi terus menerus (Continuous Duty).'
        ],
        evidence: {
          recommendationCount: 4,
          m7Count: 1,
          matchedKeywordsCount: 6
        }
      }
    }
  ];
};

export const getEquipmentRanking = async (limit = 10, year, month, plant) => {
  return [
    { equipmentNo: '400-P-101A', totalRec: 12, m7Count: 4 },
    { equipmentNo: '400-K-101', totalRec: 9, m7Count: 3 },
    { equipmentNo: '400-C-102', totalRec: 7, m7Count: 2 },
    { equipmentNo: '400-P-102B', totalRec: 6, m7Count: 2 },
    { equipmentNo: '400-E-105', totalRec: 5, m7Count: 1 },
  ];
};

export const getWorkCenterRanking = async (year, month, plant) => {
  return [
    { workCenter: 'D0179', name: 'Rotating 1', count: 42 },
    { workCenter: 'D0180', name: 'Rotating 2', count: 38 },
    { workCenter: 'D0225', name: 'PPHS & OSBL', count: 29 },
    { workCenter: 'D0169', name: 'Bengkel', count: 21 },
    { workCenter: 'D0171', name: 'Metalurgi', count: 15 },
  ];
};

export const getRootCauseDistribution = async (year, month, plant) => {
  return [
    { category: 'Vibrasi & Alignment', count: 35 },
    { category: 'Mechanical Seal & Kebocoran', count: 28 },
    { category: 'Pelumasan & Bearing', count: 22 },
    { category: 'Kelelahan Material / Korosi', count: 12 },
    { category: 'Pipa & Instrumentasi', count: 8 }
  ];
};

export const getHealthScore = async (year, month, plant) => {
  return {
    fleetAverageScore: 84,
    totalAssetsAnalyzed: 142,
    assets: [
      { equipmentNo: '400-P-101A', plantName: 'Pabrik 1A', plantCode: 'P1A', workCenter: 'D0179', healthScore: 58, status: 'Warning', color: '#F59E0B', totalRec: 12, m7Count: 4 },
      { equipmentNo: '400-K-101', plantName: 'Pabrik 2', plantCode: 'P2', workCenter: 'D0180', healthScore: 65, status: 'Warning', color: '#F59E0B', totalRec: 9, m7Count: 3 },
      { equipmentNo: '400-C-102', plantName: 'Pabrik 3', plantCode: 'P3', workCenter: 'D0225', healthScore: 78, status: 'Attention', color: '#3B82F6', totalRec: 7, m7Count: 2 },
      { equipmentNo: '400-E-105', plantName: 'Pabrik 4', plantCode: 'P4', workCenter: 'D0169', healthScore: 92, status: 'Healthy', color: '#10B981', totalRec: 2, m7Count: 0 },
    ]
  };
};

export const getExecutiveDashboard = async (year, month, plant) => {
  return {
    period: `${month || 8} - ${year || 2026}`,
    summaryMetrics: {
      topBadActor: '400-P-101A',
      topRootCause: 'Vibrasi & Alignment',
      topWorkCenter: 'D0179 - Rotating 1'
    },
    narrative: [
      'Berdasarkan data notifikasi rekomendasi dan inspeksi teknik, peralatan 400-P-101A pada Pabrik 1A mencatatkan jumlah notifikasi tertinggi dengan dominasi masalah vibrasi dan degradasi mechanical seal.',
      'Unit kerja D0179 (Rotating 1) menangani beban pekerjaan terbanyak bulan ini. Diperlukan tindakan perataan beban kerja dan inspeksi preskriptif.'
    ],
    recommendations: [
      'Lakukan inspeksi spesifik dan pengujian vibrasi pada peralatan bad actor 400-P-101A.',
      'Tingkatkan frekuensi pemantauan pelumasan pada Work Center D0179.',
      'Prioritaskan penyelesaian notifikasi M7 sebelum memasuki jadwal Turn Around.'
    ]
  };
};
