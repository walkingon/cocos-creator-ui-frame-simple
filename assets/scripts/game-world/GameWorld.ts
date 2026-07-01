import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameWorld')
export class GameWorld extends Component {

    @property({type: [Node]})
    clouds: Node[] = [];

    @property({type: [Node]})
    mountains: Node[] = [];

    @property
    baseSpeed: number = 100;

    private _maxY: number = 0;

    start() {
        this.calculateMaxY();
    }

    update(deltaTime: number) {
        this.moveClouds(deltaTime);
    }

    /** 计算所有节点中的最大y值，作为速度计算的参考 */
    private calculateMaxY(): void {
        this._maxY = 0;
        for (const cloud of this.clouds) {
            if (cloud.position.y > this._maxY) {
                this._maxY = cloud.position.y;
            }
        }
        for (const mountain of this.mountains) {
            if (mountain.position.y > this._maxY) {
                this._maxY = mountain.position.y;
            }
        }
    }

    /** 根据节点的y坐标计算速度倍率：y越小，速度越快 */
    private getSpeedMultiplier(node: Node): number {
        if (this._maxY <= 0) return 1;
        // y越小，偏离maxY越多，倍率越大
        return 1 + (this._maxY - node.position.y) / this._maxY;
    }

    /** 移动云朵：从右向左，x < -460 后重置到 x = 460 */
    private moveClouds(dt: number): void {
        for (const cloud of this.clouds) {
            const multiplier = this.getSpeedMultiplier(cloud);
            const moveX = this.baseSpeed * multiplier * dt;
            const newX = cloud.position.x - moveX;

            if (newX < -460) {
                cloud.setPosition(460, cloud.position.y, cloud.position.z);
            } else {
                cloud.setPosition(newX, cloud.position.y, cloud.position.z);
            }
        }
    }
}


