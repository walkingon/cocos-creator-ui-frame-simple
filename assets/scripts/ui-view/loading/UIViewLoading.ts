import { _decorator, Component, Node, ProgressBar, tween } from 'cc';
import { SceneMgr } from '../../scene/SceneMgr';
const { ccclass, property } = _decorator;

@ccclass('UIViewLoading')
export class UIViewLoading extends Component {

    @property(ProgressBar)
    progressBar: ProgressBar = null!;

    protected onLoad(): void {
        
    }

    start() {
        this.progressBar.progress = 0;

        tween(this.progressBar).to(2, { progress: 1 }, {
            onComplete: () => {
                SceneMgr.switchScene('SceneGame');
            }
        }).start();
    }
}


