/**
 * FSM - 有限状态机基类
 * 
 * 一个轻量级的纯逻辑有限状态机，不依赖 Cocos Component，
 * 可嵌入任意组件中使用。
 * 
 * 用法：
 *   const fsm = new FSM();
 *   fsm.addState(new IdleState());
 *   fsm.addState(new WalkState());
 *   fsm.addState(new RunState());
 *   fsm.setState('Idle');
 * 
 *   // 在组件的 update 中驱动
 *   update(dt: number): void {
 *       this.fsm.update(dt);
 *   }
 */

import { FSMState } from './FSMState';

export class FSM {

    /** 状态名 -> 状态对象 */
    private _states: Map<string, FSMState> = new Map();

    /** 当前状态对象 */
    private _current: FSMState | null = null;

    /** 当前状态名 */
    private _currentName: string = '';

    // ==================== 状态管理 ====================

    /**
     * 注册一个状态
     * @param state 状态对象（其 name 属性作为唯一标识）
     */
    addState(state: FSMState): void {
        if (!state.name) {
            console.error('[FSM] 状态缺少 name 属性，无法注册');
            return;
        }
        if (this._states.has(state.name)) {
            console.warn(`[FSM] 状态 "${state.name}" 已存在，将被覆盖`);
        }
        state.fsm = this;
        this._states.set(state.name, state);
    }

    /**
     * 切换状态
     * @param stateName 目标状态名称
     * @param args      传递给 onEnter 的额外参数
     */
    setState(stateName: string, ...args: any[]): void {
        const next = this._states.get(stateName);
        if (!next) {
            console.error(`[FSM] 状态 "${stateName}" 未注册`);
            return;
        }

        // 相同状态不重复切换
        if (this._current === next) {
            return;
        }

        const prevName = this._currentName;

        // 离开当前状态
        if (this._current) {
            this._current.onExit(stateName);
        }

        // 切换
        this._current = next;
        this._currentName = stateName;

        // 进入新状态
        next.onEnter(prevName, ...args);
    }

    /**
     * 每帧更新（调用当前状态的 onUpdate）
     * @param dt 帧间隔时间（秒）
     */
    update(dt: number): void {
        if (this._current) {
            this._current.onUpdate(dt);
        }
    }

    // ==================== 查询 ====================

    /** 获取当前状态名称 */
    get state(): string {
        return this._currentName;
    }

    /** 获取当前状态对象 */
    get currentState(): FSMState | null {
        return this._current;
    }

    /**
     * 判断某个状态是否已注册
     * @param stateName 状态名称
     */
    hasState(stateName: string): boolean {
        return this._states.has(stateName);
    }

    /**
     * 获取已注册的状态对象
     * @param stateName 状态名称
     */
    getState(stateName: string): FSMState | undefined {
        return this._states.get(stateName);
    }

    // ==================== 清理 ====================

    /**
     * 移除一个状态
     * @param stateName 状态名称
     */
    removeState(stateName: string): void {
        const state = this._states.get(stateName);
        if (state && this._current === state) {
            // 如果移除的是当前状态，先退出
            state.onExit('');
            this._current = null;
            this._currentName = '';
        }
        this._states.delete(stateName);
    }

    /** 清空所有状态并退出当前状态 */
    clear(): void {
        if (this._current) {
            this._current.onExit('');
            this._current = null;
            this._currentName = '';
        }
        this._states.clear();
    }
}
