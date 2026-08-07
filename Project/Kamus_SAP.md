# Kamus SAP

## User Status (Order)

| Kode | Nama Status | Keterangan |
|-------|-------------|------------|
| PLANN | Planning | Order baru dibuat dan sedang diplanning. |
| REVI | Revision | Order perlu direvisi. |
| COMP | Completed | Order telah selesai di TECO. |
| PLCP | Planning Completed | Order telah selesai di planning. |
| WMAT | Waiting For Material | Order sedang menunggu material untuk dieksekusi. |
| WRES | Waiting Resources | Order sedang menunggu resources untuk dieksekusi. |
| REL | Released | Order telah direlease untuk dieksekusi. |
| WTA | Waiting Turn Around | Order akan dikerjakan saat Turn Around (TA). |
| WTOL | Waiting Tools | Order sedang menunggu tools untuk dieksekusi. |
| REWO | Re-Work | Pekerjaan maintenance merupakan re-work. |
| WSER | Waiting Service | Order sedang menunggu jasa/service pihak luar untuk dieksekusi. |
| WSDN | Waiting Shutdown | Order akan dikerjakan saat shutdown. |
| SCHD | Scheduled | Order telah dijadwalkan. |
| WCON | Waiting Confirmation | Order sedang menunggu konfirmasi dari operasi untuk dieksekusi. |

---

## System Status (Order)

### CRTD – Created
Order telah dibuat dan sedang dalam proses evaluasi dan perencanaan.

### REL – Released
Order telah direlease, spare part, tools, dan tenaga kerja mungkin sudah disiapkan (committed).

### NMAT – No Material Component
Tidak ada material yang diinput pada order.

### MATS – Material Shortage
Kebutuhan material telah diperiksa (availability), telah direservasi, namun material tidak tersedia.

### CNF – Confirmed
Seluruh work center telah mengkonfirmasi pekerjaan dan telah selesai serta diserahkan kepada operasi.

### PCNF – Partially Confirmed
Sebagian work center telah mengkonfirmasi pekerjaan yang telah selesai atau sedang berlangsung.

### GMPS – Goods Movement Posted
Material telah diambil dari gudang dan digunakan serta telah dibebankan pada order.

### TECO – Technically Completed
Proses kerja pemeliharaan pada order telah selesai, seluruh dokumen telah lengkap (history, konfirmasi MH, malfunction data), dan material sisa telah direturn.

### CLSD – Closed
Secara bisnis order telah ditutup atau dibatalkan sehingga tidak dapat lagi dibebankan biaya maintenance.

---

# User Status (Notification)

| Kode | Nama Status | Keterangan |
|-------|-------------|------------|
| OSNO | Outstanding Notification | Notification baru pertama kali dibuat. |
| NOPR | Notification In Process | Notification telah disetujui oleh atasan pembuat untuk diteruskan menjadi order. |
| ORAS | Order Assigned | Status menunjukkan notification telah diubah menjadi order. |
| NOCL | Notification Closed | Status menunjukkan perintah atasan kepada supervisor/kasie untuk membatalkan notification. |
| NOCO | Notification Completed | Notification sudah ditutup atau dibatalkan / tidak disetujui untuk dijadikan order. |

---

# Relasi Status Notification SAP

```text
OSNO
↓
NOPR
↓
ORAS
↓
Notification Converted menjadi Order
↓
Notification Printed
```

---

# System Status dan User Status Notification

| Status | Arti |
|--------|------|
| OSNO | Notification baru pertama kali dibuat. |
| NOPR | Notification telah disetujui atau direlease. |
| ORAS | Notification telah di-convert menjadi order. |
| NOCO | Notification selesai (completed), ditutup, dibatalkan, atau tidak disetujui. |

---

# Singkatan Penting

| Singkatan | Arti |
|-----------|------|
| TECO | Technically Completed |
| CNF | Confirmed |
| PCNF | Partially Confirmed |
| GMPS | Goods Movement Posted |
| CLSD | Closed |
| CRTD | Created |
| REL | Released |
| MATS | Material Shortage |
| NMAT | No Material Component |
| OSNO | Outstanding Notification |
| NOPR | Notification In Process |
| ORAS | Order Assigned |
| NOCL | Notification Closed |
| NOCO | Notification Completed |