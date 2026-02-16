import { FindVendorService } from '../_workspace/services/_find-vendor/FindVendorService'

const INTERVAL_MS = 24 * 60 * 60 * 1000 // 24 ชั่วโมง

const runSync = async () => {
    const now = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })
    console.log(`[Prones Sync] Starting sync at ${now}`)

    try {
        const result = await FindVendorService.syncPronesToStaging()
        console.log(`[Prones Sync] ✅ Done — ${result.synced} rows synced`)
    } catch (error: any) {
        console.error(`[Prones Sync] ❌ Failed:`, error?.message || error)
    }
}

export const startPronesSyncScheduler = () => {
    console.log(`[Prones Sync] Scheduler registered — will sync every 24 hours`)

    // รันครั้งแรกทันทีตอน server start
    runSync()

    // ตั้ง interval ทุก 24 ชม.
    setInterval(runSync, INTERVAL_MS)
}
