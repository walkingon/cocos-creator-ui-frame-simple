import { _decorator, Component, director, isValid, Node } from 'cc';
import { ResMgr } from './ResMgr';
import { DataCom } from './DataCom';
const { ccclass, property } = _decorator;

@ccclass('UIMgr')
export class UIMgr extends Component {

    /**低层，基本界面根节点 */
    @property(Node)
    basicRoot: Node = null!;

    /**中层，常规界面跟节点 */
    @property(Node)
    normalRoot: Node = null!;

    /**高层，用于屏蔽屏幕操作等 */
    @property(Node)
    topRoot: Node = null!;


    /** 是否正在加载中（防止重复打开） */
    private _isLoading: boolean = false;

    // ==================== 生命周期 ====================

    onLoad(): void {
        UIMgr._instance = this;
    }

    onDestroy(): void {
        if (UIMgr._instance === this) {
            UIMgr._instance = null;
        }
    }

    // ==================== 静态公开方法 ====================

    /**
     * 打开UI界面
     * @param prefabPath resources/prefabs/ui-view 下的预制体路径，例如："home/UIViewHome"
     * @param args 传递参数
     * @param isBasic 是否是场景的基本界面。如果是基本界面，则会在加载完成后销毁旧的基本界面
     * @returns 
     */
    static async openUIView(prefabPath: string, args?: any, isBasic:boolean = false): Promise<Node | null> {
        const self = UIMgr._instance;
        if (!self) {
            console.error('[UIMgr] 未初始化，请确保 UIMgr 已挂载到场景常驻节点');
            return null;
        }

        const node = await self._loadView(prefabPath, isBasic ? self.basicRoot : self.normalRoot, args);
        if (node) {
            console.log(`[UIMgr] 打开 View: ${prefabPath}`);
        }

        if(isBasic){
            //新界面加载后再销毁旧界面，避免闪屏
            const children = self.basicRoot.children;
            for(let i = children.length - 1; i >= 0; i--) {
                const child = children[i];
                if (child !== node && isValid(child)) {
                    child.destroy();
                }
            }
        }

        return node;
    }

    /**关闭所有常规界面 */
    static closeAllUIView(): void {
        const self = UIMgr._instance;
        if (!self) {
            console.error('[UIMgr] 未初始化，请确保 UIMgr 已挂载到场景常驻节点');
            return;
        }
        self.normalRoot.destroyAllChildren();
    }

    // ==================== 内部实例方法 ====================

    /**
     * 内部：加载 View 预制体并挂载到指定父节点
     * @param prefabPath resources/prefabs/ui-view 下的预制体路径
     * @param parentNode 挂载的目标父节点
     * @param args       传递给 View 的参数
     */
    private async _loadView(prefabPath: string, parentNode: Node | null, args?: any): Promise<Node | null> {
        if (this._isLoading) {
            console.warn(`[UIMgr] 正在加载中，忽略重复请求: ${prefabPath}`);
            return null;
        }

        this._isLoading = true;

        const node = await ResMgr.instantiatePrefab(`prefabs/ui-view/${prefabPath}`);
        if (!node) {
            this._isLoading = false;
            return null;
        }

        if (args) {
            const dataCom = node.getComponent(DataCom) || node.addComponent(DataCom);
            dataCom.setViewArgs(args);
        }

        if (parentNode) {
            parentNode.addChild(node);
        }

        this._isLoading = false;
        return node;
    }



    // ==================== 单例 ====================

    private static _instance: UIMgr | null = null;
}


