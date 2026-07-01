/**
 * FSMState - 有限状态机状态基类
 * 
 * 用法：
 *   1. 继承 FSMState 实现具体状态
 *   2. 重写 onEnter / onUpdate / onExit 生命周期方法
 *   3. 通过 this.fsm.setState() 触发状态切换
 * 
 * 示例：
 *   class IdleState extends FSMState {
 *       onEnter(prevState: string): void { console.log('进入 Idle'); }
 *       onUpdate(dt: number): void {  if (条件) this.fsm.setState('Walk'); }
 *       onExit(nextState: string): void { console.log('离开 Idle'); }
 *   }
 */

/**
 * FSM 的最小接口声明（打破循环依赖）
 * 实际由 FSM 类实现，此处仅声明 FSMState 需要调用的方法。
 */
export interface IFSM {
    setState(stateName: string, ...args: any[]): void;
}

/** 状态生命周期接口（可选实现以增强类型约束） */
export interface IFSMState {
    /** 进入状态时调用 */
    onEnter(prevState?: string, ...args: any[]): void;
    /** 每帧更新时调用 */
    onUpdate(dt: number): void;
    /** 离开状态时调用 */
    onExit(nextState?: string): void;
}

/**
 * 状态基类
 * 所有具体状态都应继承此类并重写生命周期方法。
 */
export abstract class FSMState implements IFSMState {

    /** 状态名称（唯一标识） */
    name: string = '';

    /** 所属状态机引用，由 FSM.addState 自动注入 */
    fsm: IFSM | null = null;

    // ==================== 生命周期 ====================

    /**
     * 进入状态
     * @param prevState 上一个状态名称
     * @param args      切换状态时传入的额外参数
     */
    onEnter(_prevState?: string, ..._args: any[]): void {
        // 子类重写
    }

    /**
     * 每帧更新（需要在 FSM.update 中驱动）
     * @param dt 帧间隔时间（秒）
     */
    onUpdate(_dt: number): void {
        // 子类重写
    }

    /**
     * 离开状态
     * @param nextState 即将进入的状态名称
     */
    onExit(_nextState?: string): void {
        // 子类重写
    }
}
