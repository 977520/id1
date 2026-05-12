export default function handler(req, res) {
    // ===================== 你只需要改下面这1个地方 =====================
    const EXPIRE_SECONDS = 120; // 每人有效期（秒），2分钟=120，3天=259200
    // ================================================================

    // 生成设备指纹（后端计算，不依赖前端存储）
    const ip = req.headers.get("x-forwarded-for") || req.ip || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";
    const acceptLanguage = req.headers.get("accept-language") || "unknown";
    
    // 简单哈希生成唯一标识
    const fingerprint = btoa(`${ip}|${userAgent.slice(0, 100)}|${acceptLanguage.slice(0, 50)}`);
    
    // 云端存储（Cloudflare Pages 全局变量）
    if (!globalThis.deviceDB) {
        globalThis.deviceDB = new Map();
    }
    
    const db = globalThis.deviceDB;
    const now = Date.now();
    
    // 首次访问记录时间
    if (!db.has(fingerprint)) {
        db.set(fingerprint, now);
    }
    
    // 计算剩余时间
    const firstVisit = db.get(fingerprint);
    const elapsed = now - firstVisit;
    const remaining = Math.max(0, EXPIRE_SECONDS - Math.floor(elapsed / 1000));
    
    // 清理过期数据（防止内存溢出）
    if (db.size > 10000) {
        const cutoff = now - EXPIRE_SECONDS * 1000;
        for (const [key, time] of db.entries()) {
            if (time < cutoff) {
                db.delete(key);
            }
        }
    }
    
    res.status(200).json({
        expired: remaining <= 0,
        left: remaining
    });
}
