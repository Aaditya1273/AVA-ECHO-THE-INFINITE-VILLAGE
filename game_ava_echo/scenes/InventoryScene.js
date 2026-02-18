import Phaser from "phaser";

export class InventoryScene extends Phaser.Scene {
    constructor() {
        super({ key: "InventoryScene" });
        this.inventory = [];
    }

    init(data) {
        // Always get fresh inventory data from HomeScene
        const homeScene = this.scene.get('HomeScene');
        if (homeScene && homeScene.playerInventory) {
            this.inventory = Array.from(homeScene.playerInventory);
        } else {
            this.inventory = data.inventory || [];
        }
    }

    create() {
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.7).setOrigin(0);

        const panelWidth = this.cameras.main.width * 0.6;
        const panelHeight = this.cameras.main.height * 0.7;
        const panelX = this.cameras.main.centerX;
        const panelY = this.cameras.main.centerY;

        this.add.graphics()
            .fillStyle(0x1a1a1a, 1)
            .fillRoundedRect(panelX - panelWidth / 2, panelY - panelHeight / 2, panelWidth, panelHeight, 16)
            .lineStyle(2, 0xd4af37, 1)
            .strokeRoundedRect(panelX - panelWidth / 2, panelY - panelHeight / 2, panelWidth, panelHeight, 16);

        this.add.text(panelX, panelY - panelHeight / 2 + 50, 'Your Inventory', {
            fontFamily: 'Georgia, serif', fontSize: '32px', color: '#ffffff', align: 'center'
        }).setOrigin(0.5);

        if (this.inventory.length === 0) {
            this.add.text(panelX, panelY, 'Your inventory is empty.', {
                fontFamily: 'Arial', fontSize: '20px', color: '#dddddd', align: 'center'
            }).setOrigin(0.5);
        } else {
            this.inventory.forEach((item, index) => {
                const itemName = item.replace(/_/g, ' ');
                const itemY = panelY - panelHeight / 2 + 120 + (index * 60);

                this.add.text(panelX - 50, itemY, `• ${itemName}`, {
                    fontFamily: 'Arial', fontSize: '24px', color: '#ffffff'
                }).setOrigin(0.5);

                const tpBtn = this.add.text(panelX + 100, itemY, '[TELEPORT]', {
                    fontFamily: 'Arial', fontSize: '14px', color: '#d4af37',
                    backgroundColor: '#333333', padding: { x: 5, y: 5 }
                }).setOrigin(0.5).setInteractive({ useHandCursor: true });

                tpBtn.on('pointerdown', () => this.simulateTeleport(item));
            });
        }

        this.createButton(panelX, panelY + panelHeight / 2 - 60, 'Close', () => this.closeScene());
    }

    async simulateTeleport(item) {
        const feedback = this.add.text(this.cameras.main.centerX, 100, `Teleporting ${item} via Avalanche Teleporter...`, {
            fontSize: '18px', color: '#ffffff', backgroundColor: '#d4af37', padding: { x: 10, y: 5 }
        }).setOrigin(0.5);

        await new Promise(r => setTimeout(r, 1500));
        feedback.setText(`${item} sent to Avalanche C-Chain!`);

        // Remove from local display
        this.inventory = this.inventory.filter(i => i !== item);
        const homeScene = this.scene.get('HomeScene');
        if (homeScene && homeScene.playerInventory) {
            homeScene.playerInventory.delete(item);
        }

        this.time.delayedCall(2000, () => {
            feedback.destroy();
            this.scene.restart(); // Refresh list
        });
    }

    closeScene() {
        this.scene.resume('HomeScene');
        this.scene.stop();
    }

    createButton(x, y, text, callback) {
        const button = this.add.text(x, y, text, {
            fontFamily: 'Arial', fontSize: '24px', color: '#000000',
            backgroundColor: '#d4af37', padding: { x: 20, y: 10 },
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        button.on('pointerover', () => button.setBackgroundColor('#f5d56b'));
        button.on('pointerout', () => button.setBackgroundColor('#d4af37'));
        button.on('pointerdown', callback);
        return button;
    }
}