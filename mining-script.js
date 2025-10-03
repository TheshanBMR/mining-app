class CryptoMiner {
    constructor() {
        this.isMining = false;
        this.balance = 0.00000100; // Starting bonus
        this.hashRate = 0;
        this.activeMiners = 0;
        this.miningInterval = null;
        this.rewardInterval = null;
        this.nextRewardTime = 300; // 5 minutes in seconds
        
        this.initializeEventListeners();
        this.updateDisplay();
        this.startRealTimeUpdates();
    }

    initializeEventListeners() {
        const miningButton = document.getElementById('miningButton');
        miningButton.addEventListener('click', () => this.toggleMining());
    }

    toggleMining() {
        const button = document.getElementById('miningButton');
        const buttonText = button.querySelector('.btn-text');
        const loading = button.querySelector('.loading');

        if (!this.isMining) {
            // Start mining
            this.isMining = true;
            button.classList.add('stop');
            buttonText.textContent = 'Stop Mining';
            loading.style.display = 'inline-block';
            
            this.startMining();
            this.addTransaction('Mining Started', 0);
        } else {
            // Stop mining
            this.isMining = false;
            button.classList.remove('stop');
            buttonText.textContent = 'Start Mining';
            loading.style.display = 'none';
            
            this.stopMining();
            this.addTransaction('Mining Stopped', 0);
        }
    }

    startMining() {
        // Simulate mining process
        this.activeMiners = 1;
        this.hashRate = this.generateRandomHashRate();
        
        this.miningInterval = setInterval(() => {
            this.hashRate = this.generateRandomHashRate();
            this.updateDisplay();
        }, 2000);

        // Simulate rewards
        this.rewardInterval = setInterval(() => {
            if (this.isMining) {
                this.generateReward();
            }
        }, 1000);

        this.startRewardCountdown();
    }

    stopMining() {
        this.activeMiners = 0;
        this.hashRate = 0;
        
        if (this.miningInterval) {
            clearInterval(this.miningInterval);
        }
        if (this.rewardInterval) {
            clearInterval(this.rewardInterval);
        }
        
        this.updateDisplay();
    }

    generateRandomHashRate() {
        // Generate random hash rate between 50-150 H/s
        return Math.floor(Math.random() * 100) + 50;
    }

    generateReward() {
        // Simulate finding a block and receiving reward
        const rewardChance = Math.random();
        if (rewardChance < 0.01) { // 1% chance per second to find a block
            const reward = this.calculateReward();
            this.balance += reward;
            this.addTransaction('Block Mined', reward);
            this.updateDisplay();
        }
    }

    calculateReward() {
        // Simulate variable mining rewards
        const baseReward = 0.00000050; // 50 satoshis
        const variance = Math.random() * 0.00000025; // Additional random reward
        return baseReward + variance;
    }

    startRewardCountdown() {
        let timeLeft = this.nextRewardTime;
        
        const countdownInterval = setInterval(() => {
            if (!this.isMining) {
                clearInterval(countdownInterval);
                return;
            }
            
            timeLeft--;
            
            if (timeLeft <= 0) {
                timeLeft = this.nextRewardTime;
                this.generateGuaranteedReward();
            }
            
            this.updateCountdown(timeLeft);
            this.updateProgress(timeLeft);
        }, 1000);
    }

    generateGuaranteedReward() {
        const reward = 0.00000100; // Guaranteed reward
        this.balance += reward;
        this.addTransaction('Guaranteed Reward', reward);
        this.updateDisplay();
    }

    updateCountdown(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        const countdownText = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        document.getElementById('nextReward').textContent = countdownText;
    }

    updateProgress(secondsLeft) {
        const progress = ((this.nextRewardTime - secondsLeft) / this.nextRewardTime) * 100;
        document.getElementById('miningProgress').style.width = `${progress}%`;
    }

    addTransaction(description, amount) {
        const transactionList = document.getElementById('transactionList');
        const transactionItem = document.createElement('div');
        transactionItem.className = 'transaction-item';
        
        const amountClass = amount > 0 ? 'positive' : '';
        const amountText = amount > 0 ? `+${amount.toFixed(8)} BTC` : `${amount.toFixed(8)} BTC`;
        
        transactionItem.innerHTML = `
            <span>${description}</span>
            <span class="${amountClass}">${amountText}</span>
        `;
        
        transactionList.insertBefore(transactionItem, transactionList.firstChild);
        
        // Keep only last 10 transactions
        if (transactionList.children.length > 10) {
            transactionList.removeChild(transactionList.lastChild);
        }
    }

    updateDisplay() {
        // Update balance
        document.getElementById('totalBalance').textContent = `${this.balance.toFixed(8)} BTC`;
        
        // Update hash rate
        document.getElementById('hashRate').textContent = `${this.hashRate} H/s`;
        document.getElementById('currentHashRate').textContent = `${this.hashRate} H/s`;
        
        // Update active miners
        document.getElementById('activeMiners').textContent = this.activeMiners;
        
        // Update daily earnings (estimate)
        const dailyEstimate = this.hashRate * 0.00000001;
        document.getElementById('dailyEarnings').textContent = `${dailyEstimate.toFixed(8)} BTC`;
        
        // Update USD value (simulated)
        const btcPrice = 45000; // Simulated BTC price
        const usdValue = this.balance * btcPrice;
        document.querySelector('#totalBalance + div').textContent = `≈ $${usdValue.toFixed(2)} USD`;
    }

    startRealTimeUpdates() {
        // Simulate real-time market updates
        setInterval(() => {
            if (this.isMining) {
                // Small random fluctuations in displayed values
                const fluctuation = (Math.random() - 0.5) * 0.00000001;
                this.balance += fluctuation;
                this.updateDisplay();
            }
        }, 5000);
    }
}

// Initialize the mining app when page loads
document.addEventListener('DOMContentLoaded', () => {
    new CryptoMiner();
});

// Add some realistic browser mining simulation (completely client-side, no actual mining)
function simulateBrowserMining() {
    if (typeof Worker !== 'undefined') {
        const worker = new Worker(URL.createObjectURL(new Blob([`
            let count = 0;
            setInterval(() => {
                // Simulate computational work
                for (let i = 0; i < 1000000; i++) {
                    count += Math.sqrt(i) * Math.random();
                }
                postMessage({ count: count });
            }, 1000);
        `], { type: 'application/javascript' })));
        
        worker.onmessage = function(e) {
            console.log('Mining simulation running...', e.data);
        };
        
        return worker;
    }
    return null;
}

// Optional: Start browser mining simulation (very light, for demonstration only)
// const miningWorker = simulateBrowserMining();