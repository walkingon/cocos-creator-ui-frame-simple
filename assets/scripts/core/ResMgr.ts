import { _decorator, Component, resources, Asset, Prefab, SpriteFrame, AudioClip, instantiate, Node } from 'cc';

/**
 * 资源管理器 — 统一管理所有 resources 下的资源加载与缓存
 * 
 * 使用方式：
 *   // 加载并实例化 Prefab
 *   const node = await ResMgr.instantiatePrefab('prefabs/HomePanel');
 * 
 *   // 加载图片
 *   const sprite = await ResMgr.loadAsset('textures/icon', SpriteFrame);
 * 
 *   // 加载音效
 *   const clip = await ResMgr.loadAsset('audio/bgm', AudioClip);
 * 
 *   // 手动释放某个资源（减少引用计数，计数归零时释放）
 *   ResMgr.release('prefabs/HomePanel');
 */
export class ResMgr {

    // ==================== 公开方法 ====================

    /**
     * 加载并实例化一个 Prefab
     * @param path resources 下路径，不含扩展名
     * @returns 实例化后的节点，失败返回 null
     */
    static async instantiatePrefab(path: string): Promise<Node | null> {
        const prefab = await ResMgr.loadAsset<Prefab>(path, Prefab);
        if (!prefab) return null;
        return instantiate(prefab);
    }

    /**
     * 加载一个资源（带缓存）
     * @param path  resources 下路径，不含扩展名
     * @param type  资源类型（Prefab / SpriteFrame / AudioClip 等）
     * @returns     加载到的资源，失败返回 null
     */
    static async loadAsset<T extends Asset>(path: string, type: new (...args: any[]) => T): Promise<T | null> {
        // 1. 命中缓存，增加引用计数
        const cached = ResMgr._cache.get(path);
        if (cached) {
            cached.refCount++;
            return cached.asset as T;
        }

        // 2. 正在加载中，等待同一个 Promise（防止并发重复请求）
        const pending = ResMgr._pendingLoads.get(path);
        if (pending) {
            const asset = await pending;
            if (asset) {
                const entry = ResMgr._cache.get(path);
                if (entry) entry.refCount++;
            }
            return asset as T | null;
        }

        // 3. 首次加载
        const loadPromise = new Promise<Asset | null>((resolve) => {
            resources.load(path, type, (err, asset) => {
                if (err) {
                    console.error(`[ResMgr] 加载资源失败: ${path}`, err);
                    resolve(null);
                    return;
                }

                ResMgr._cache.set(path, { asset, refCount: 1 });
                console.log(`[ResMgr] 加载成功: ${path} (ref=1)`);
                resolve(asset);
            });
        });

        ResMgr._pendingLoads.set(path, loadPromise);

        const result = await loadPromise;

        ResMgr._pendingLoads.delete(path);
        return result as T | null;
    }

    /**
     * 释放一个资源（减少引用计数，归零时从缓存移除）
     * @param path 资源路径
     */
    static release(path: string): void {
        const cached = ResMgr._cache.get(path);
        if (!cached) return;

        cached.refCount--;
        console.log(`[ResMgr] release: ${path} (ref=${cached.refCount})`);

        if (cached.refCount <= 0) {
            ResMgr._cache.delete(path);
            // 释放底层资源
            cached.asset.decRef();
            console.log(`[ResMgr] 资源已释放: ${path}`);
        }
    }

    /**
     * 释放一组资源
     * @param paths 资源路径数组
     */
    static releaseMany(paths: string[]): void {
        for (const path of paths) {
            ResMgr.release(path);
        }
    }

    /**
     * 获取缓存的资源（不增加引用计数）
     * @param path 资源路径
     */
    static getAsset<T extends Asset>(path: string): T | null {
        const cached = ResMgr._cache.get(path);
        return cached ? (cached.asset as T) : null;
    }

    /**
     * 清空所有缓存资源
     */
    static clearCache(): void {
        console.log(`[ResMgr] 清空缓存 (${ResMgr._cache.size} 项, ${ResMgr._pendingLoads.size} 项待加载)`);
        for (const [, cached] of ResMgr._cache) {
            cached.asset.decRef();
        }
        ResMgr._cache.clear();
        ResMgr._pendingLoads.clear();
    }

    /**
     * 获取当前缓存的资源数量
     */
    static get cacheCount(): number {
        return ResMgr._cache.size;
    }

    // ==================== 内部 ====================

    private static _cache: Map<string, CacheEntry> = new Map();

    /** 正在加载中的 Promise，防止并发重复请求 */
    private static _pendingLoads: Map<string, Promise<Asset | null>> = new Map();
}

/** 缓存条目 */
interface CacheEntry {
    asset: Asset;
    refCount: number;
}
