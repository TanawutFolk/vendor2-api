import { FindVendorService } from '../_workspace/services/_find-vendor/FindVendorService'

const DAILY_HOUR = 12.30 // 18:00 น. (6 โมงเย็น) เวลาไทย
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

/** คำนวณ milliseconds ที่เหลือจากตอนนี้ถึง 18:00 น. วันนี้ (หรือพรุ่งนี้ถ้าเลยแล้ว) */
const getMsUntilNextRun = (): number => {
    const nowUtc = new Date()
    // แปลงเป็นเวลาไทย (UTC+7)
    const bangkokOffset = 7 * 60 * 60 * 1000
    const nowBangkok = new Date(nowUtc.getTime() + bangkokOffset)

    const next = new Date(nowBangkok)
    next.setUTCHours(DAILY_HOUR, 0, 0, 0) // ตั้งเป็น 18:00:00.000 เวลาไทย

    if (next.getTime() <= nowBangkok.getTime()) {
        // ถ้าเลย 18:00 แล้ววันนี้ → ไปรันพรุ่งนี้
        next.setUTCDate(next.getUTCDate() + 1)
    }

    return next.getTime() - nowBangkok.getTime()
}

export const startPronesSyncScheduler = () => {
    const msUntilFirst = getMsUntilNextRun()
    const hours = Math.floor(msUntilFirst / 1000 / 60 / 60)
    const minutes = Math.floor((msUntilFirst / 1000 / 60) % 60)

    console.log(`[Prones Sync] Scheduler registered — จะ sync ครั้งถัดไปใน ${hours}h ${minutes}m (ทุกวัน 12:30 น.)`)

    // รอจนถึง 18:00 น. แล้วค่อยรันครั้งแรก
    setTimeout(() => {
        runSync()
        // หลังจากนั้น loop ทุก 24 ชม. ตรงเวลาเดิม
        setInterval(runSync, INTERVAL_MS)
    }, msUntilFirst)
}
