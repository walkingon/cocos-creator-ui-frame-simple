import { _decorator, Component, Label, Node } from 'cc';
import { DataCom } from '../../core/DataCom';
import { EventBus } from '../../core/EventBus';
const { ccclass, property } = _decorator;

@ccclass('UIViewTip')
export class UIViewTip extends Component {

    @property(Label)
    content:Label = null!;

    start() {
        const dataCom = this.getComponent(DataCom)
        if(dataCom){
            const idx = dataCom.getViewArgs().idx;
            this.content.string = `这是第 ${idx} 个弹窗`;
            const sx = -130
            const sy = 270
            const gapx = 30
            const gapy = 30
            const x = sx + idx * gapx
            const y = sy - idx * gapy
            this.node.setPosition(x, y, 0)
        }
    }

    onBtnClose(){
        this.node.destroy();
        EventBus.emit('TipViewClosed');
    }
}


