import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DataCom')
export class DataCom extends Component {
    private _data: Map<string, any> = new Map();

    setData(key: string, value: any): void {
        this._data.set(key, value);
    }

    getData(key: string): any {
        return this._data.get(key);
    }

    /**设置View参数快捷方式 */
    setViewArgs(value: any): void {
        this._data.set('ViewArgs', value);
    }

    /**获取View参数快捷方式 */
    getViewArgs(): any {
        return this._data.get('ViewArgs');
    }
}


