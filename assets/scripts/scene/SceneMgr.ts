import {_decorator, Component, director } from "cc";
import { FSM } from "../core/fsm/FSM";
import { SceneGame } from "./SceneGame";
import { SceneLoading } from "./SceneLoading";
const { ccclass, property } = _decorator;

@ccclass('SceneMgr')
export class SceneMgr extends Component {

    private _sceneFSM: FSM = null;

    private static _instance: SceneMgr = null!;

    protected onLoad(): void {
        SceneMgr._instance = this;

        director.addPersistRootNode(this.node);

        this.init();
    }

    private init(): void {
        const self = SceneMgr._instance;
        if (!self) {
            console.error('[SceneMgr] 未初始化，请确保 SceneMgr 已挂载到场景常驻节点');
            return;
        }
        self._sceneFSM = new FSM();
        self._sceneFSM.addState(new SceneLoading())
        self._sceneFSM.addState(new SceneGame())
    }
    
    start() {
        this._sceneFSM.setState('SceneLoading');
    }

    update(dt: number): void {
        this._sceneFSM.update(dt);
    }

    public static switchScene(sceneName: string, ...args: any[]): void {
        const self = SceneMgr._instance;
        if (!self) {
            console.error('[SceneMgr] 未初始化，请确保 SceneMgr 已挂载到场景常驻节点');
            return;
        }
        self._sceneFSM.setState(sceneName, ...args);
    }
}

