import { _decorator, Component, Node } from 'cc';
import { UIMgr } from '../../core/UIMgr';
import { EventBus } from '../../core/EventBus';
import { SceneMgr } from '../../scene/SceneMgr';
const { ccclass, property } = _decorator;

@ccclass('UIViewGame')
export class UIViewGame extends Component {

    idx = 0;

    start(){
        EventBus.on('TipViewClosed', this.onTipViewClosed, this)
    }

    onTipViewClosed(){
        this.idx--;
        console.log('TipViewClosed, idx = ', this.idx)
    }
    
    onBtnNewView(){
        if(this.idx > 8){
            console.log('Enough is enough!')
            return
        }
        this.idx++;
        UIMgr.openUIView('common/UIViewTip', {idx: this.idx});
    }

    onBtnSwitchScene(){
        UIMgr.closeAllUIView();
        SceneMgr.switchScene('SceneLoading')
    }

    onDestroy(){
        EventBus.off('TipViewClosed', this.onTipViewClosed, this)
    }
}


