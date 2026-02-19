import { FindVendorService } from '../_workspace/services/_find-vendor/FindVendorService'

const INTERVAL_MS = 24 * 60 * 60 * 1000 // 24 ชั่วโมง

const runSync = async () => {
    const now = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })
    console.log(`[Prones Sync] Starting sync at ${now}`)

    try {
        // Step 1: Sync Oracle → staging_prones_data
        const syncResult = await FindVendorService.syncPronesToStaging()
        console.log(`[Prones Sync] ✅ Step 1 Done — ${syncResult.synced} rows synced to staging`)

        // Step 2: Match staging_prones_data × vendors → vendor_match_result
        const matchResult = await FindVendorService.runVendorMatching()
        console.log(`[Prones Sync] ✅ Step 2 Done — ${matchResult.total} vendors checked, ${matchResult.registered} registered`)

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
