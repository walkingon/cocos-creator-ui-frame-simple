import { _decorator, Component } from 'cc';
const { ccclass } = _decorator;

/** 事件回调类型 */
type EventCallback = (...args: any[]) => void;

/** 单个监听器信息 */
interface Listener {
    callback: EventCallback;
    target: any;
    once: boolean;
}

/**
 * 全局事件总线
 * 
 * 用法：
 *   EventBus.on('coin_collected', this.onCoinCollected, this);
 *   EventBus.emit('coin_collected', coinValue, coinType);
 *   EventBus.off('coin_collected', this.onCoinCollected, this);
 * 
 * 挂载到场景常驻节点后，可通过 EventBus.I 静态访问。
 * 支持 target 参数，可在组件 onDestroy 时自动清理监听。
 */
@ccclass('EventBus')
export class EventBus extends Component {

    private static _instance: EventBus | null = null;

    /** 事件 -> 监听器列表 */
    private _events: Map<string, Listener[]> = new Map();

    // ==================== 生命周期 ====================

    onLoad(): void {
        EventBus._instance = this;
    }

    onDestroy(): void {
        if (EventBus._instance === this) {
            EventBus._instance = null;
        }
        this._events.clear();
    }

    // ==================== 静态公开方法 ====================

    /** 获取单例（需确保 EventBus 已挂载到场景中） */
    static get I(): EventBus {
        if (!EventBus._instance) {
            console.error('[EventBus] 未初始化，请将 EventBus 组件挂载到场景常驻节点');
        }
        return EventBus._instance!;
    }

    /**
     * 注册事件监听
     * @param event    事件名
     * @param callback 回调函数
     * @param target   绑定对象（用于 off 匹配及销毁时清理）
     */
    static on(event: string, callback: EventCallback, target?: any): void {
        EventBus.I?._addListener(event, callback, target, false);
    }

    /**
     * 注册一次性事件监听（触发后自动移除）
     * @param event    事件名
     * @param callback 回调函数
     * @param target   绑定对象
     */
    static once(event: string, callback: EventCallback, target?: any): void {
        EventBus.I?._addListener(event, callback, target, true);
    }

    /**
     * 移除事件监听
     * @param event    事件名
     * @param callback 回调函数
     * @param target   绑定对象
     */
    static off(event: string, callback: EventCallback, target?: any): void {
        EventBus.I?._removeListener(event, callback, target);
    }

    /** 移除某个 target 上的所有监听（一般在组件 onDestroy 中调用） */
    static offAllByTarget(target: any): void {
        EventBus.I?._removeAllByTarget(target);
    }

    /** 移除某个事件的所有监听 */
    static offAllByEvent(event: string): void {
        EventBus.I?._events.delete(event);
    }

    /** 移除所有监听 */
    static offAll(): void {
        EventBus.I?._events.clear();
    }

    /**
     * 触发事件
     * @param event 事件名
     * @param args  传递给回调的参数
     */
    static emit(event: string, ...args: any[]): void {
        EventBus.I?._emitEvent(event, ...args);
    }

    // ==================== 内部实现 ====================

    private _addListener(event: string, callback: EventCallback, target: any, once: boolean): void {
        if (!this._events.has(event)) {
            this._events.set(event, []);
        }

        const listeners = this._events.get(event)!;

        // 防止重复注册（相同的 callback + target）
        if (listeners.some(l => l.callback === callback && l.target === target)) {
            console.warn(`[EventBus] 重复注册: ${event}`, callback);
            return;
        }

        listeners.push({ callback, target, once });
    }

    private _removeListener(event: string, callback: EventCallback, target: any): void {
        const listeners = this._events.get(event);
        if (!listeners) return;

        const idx = listeners.findIndex(l => l.callback === callback && l.target === target);
        if (idx !== -1) {
            listeners.splice(idx, 1);
        }

        // 列表空了就删掉 key
        if (listeners.length === 0) {
            this._events.delete(event);
        }
    }

    private _removeAllByTarget(target: any): void {
        this._events.forEach((listeners, event) => {
            const filtered = listeners.filter(l => l.target !== target);
            if (filtered.length === 0) {
                this._events.delete(event);
            } else {
                this._events.set(event, filtered);
            }
        });
    }

    private _emitEvent(event: string, ...args: any[]): void {
        const listeners = this._events.get(event);
        if (!listeners || listeners.length === 0) return;

        // 浅拷贝，避免在回调中修改原数组导致遍历异常
        const snapshot = [...listeners];

        for (const l of snapshot) {
            // 如果该监听器在本次 emit 中被移除了（比如 once 或回调内 off），跳过
            if (!this._events.has(event)) break;
            const current = this._events.get(event)!;
            if (current.indexOf(l) === -1) continue;

            try {
                l.callback.call(l.target, ...args);
            } catch (e) {
                console.error(`[EventBus] 事件 ${event} 回调执行异常:`, e);
            }

            if (l.once) {
                this._removeListener(event, l.callback, l.target);
            }
        }
    }
}
