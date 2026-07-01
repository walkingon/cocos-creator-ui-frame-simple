import { director } from "cc";
import { FSMState } from "../core/fsm/FSMState";
import { UIMgr } from "../core/UIMgr";

export class SceneLoading extends FSMState {
    
        /** 状态名称（唯一标识） */
        name: string = 'SceneLoading';
    
        // ==================== 生命周期 ====================
    
        /**
         * 进入状态
         * @param prevState 上一个状态名称
         * @param args      切换状态时传入的额外参数
         */
        onEnter(_prevState?: string, ..._args: any[]): void {
            director.loadScene('Loading', ()=>{
                UIMgr.openUIView('loading/UIViewLoading', null, true);
            })
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