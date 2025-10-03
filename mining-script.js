class CryptoMiner {
    constructor() {
        this.isMining = false;
        this.balance = this.loadBalance();
        this.hashRate = 0;
        this.activeMiners = 0;
        this.miningInterval = null;
        this.rewardInterval = null;
        this.nextRewardTime = 30; // 1 minutes in seconds
        this.transactions = this.loadTransactions();
        this.btc = 45000;
        
        this.initializeEventListeners();
        this.updateDisplay();
        this.loadTransactionHistory();
        this.startRealTimeUpdates();
        this.fetchBitcoinPrice();
    }

    fetchBitcoinPrice() {
        try {
            const price = await this.getBitcoinPrice();
            if (price && price > 0) {
                this.btc = price;
                this.updateDisplay();
                console.log(price);
            }
        } catch (error) {
            console.error(error);
            this.useFallbackPrice();
        }
    }

    getBitcoinPrice() {
        // Try multiple APIs for reliability
        const APIs = [
            this.fetchFromBinance()
        ];

        for (const apiCall of APIs) {
            try {
                const price = await apiCall;
                if (price && price > 0) {
                    return price;
                }
            } catch (error) {
                console.warn('API failed, trying next...');
            }
        }
        
        throw new Error('All APIs failed');
    }

    fetchFromBinance() {
        // Method 2: Binance API
        const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
        const data = await response.json();
        return parseFloat(data.price);
    }

    // LocalStorage Methods
    loadBalance() {
        const savedBalance = localStorage.getItem('cryptoMiner_balance');
        return savedBalance ? parseFloat(savedBalance) : 0.00000100; // Default starting bonus
    }

    saveBalance() {
        localStorage.setItem('cryptoMiner_balance', this.balance.toString());
    }

    loadTransactions() {
        const savedTransactions = localStorage.getItem('cryptoMiner_transactions');
        return savedTransactions ? JSON.parse(savedTransactions) : [
            {
                id: this.generateId(),
                description: 'Welcome Bonus',
                amount: 0.00000100,
                timestamp: new Date().toISOString(),
                type: 'bonus'
            }
        ];
    }

    saveTransactions() {
        localStorage.setItem('cryptoMiner_transactions', JSON.stringify(this.transactions));
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
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
            this.addTransaction('Mining Started', 0, 'info');
        } else {
            // Stop mining
            this.isMining = false;
            button.classList.remove('stop');
            buttonText.textContent = 'Start Mining';
            loading.style.display = 'none';
            
            this.stopMining();
            this.addTransaction('Mining Stopped', 0, 'info');
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
            this.addTransaction('Block Mined', reward, 'reward');
            this.saveBalance();
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
        this.addTransaction('Guaranteed Reward', reward, 'guaranteed');
        this.saveBalance();
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

    addTransaction(description, amount, type = 'reward') {
        const transaction = {
            id: this.generateId(),
            description: description,
            amount: amount,
            timestamp: new Date().toISOString(),
            type: type
        };
        
        this.transactions.unshift(transaction);
        
        // Keep only last 50 transactions to prevent storage overload
        if (this.transactions.length > 50) {
            this.transactions = this.transactions.slice(0, 50);
        }
        
        this.saveTransactions();
        this.loadTransactionHistory();
    }

    loadTransactionHistory() {
        const transactionList = document.getElementById('transactionList');
        transactionList.innerHTML = '';
        
        // Display only the last 10 transactions
        const recentTransactions = this.transactions.slice(0, 10);
        
        recentTransactions.forEach(transaction => {
            const transactionItem = document.createElement('div');
            transactionItem.className = 'transaction-item';
            
            const amountClass = transaction.amount > 0 ? 'positive' : 
                              transaction.amount < 0 ? 'negative' : '';
            
            const amountText = transaction.amount > 0 ? 
                `+${transaction.amount.toFixed(8)} BTC` : 
                transaction.amount < 0 ? 
                `${transaction.amount.toFixed(8)} BTC` : 
                '—';
            
            // Format timestamp
            const date = new Date(transaction.timestamp);
            const timeString = date.toLocaleTimeString();
            
            transactionItem.innerHTML = `
                <div>
                    <div>${transaction.description}</div>
                    <div style="font-size: 0.8em; opacity: 0.7;">${timeString}</div>
                </div>
                <span class="${amountClass}">${amountText}</span>
            `;
            
            transactionList.appendChild(transactionItem);
        });
        
        // Show message if no transactions
        if (this.transactions.length === 0) {
            transactionList.innerHTML = '<div class="transaction-item" style="text-align: center; opacity: 0.7;">No transactions yet</div>';
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
        const btcPrice = this.btc.toLocaleString(); // Simulated BTC price
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
                this.saveBalance();
                this.updateDisplay();
            }
        }, 5000);
    }

    // Method to clear all data (for testing/reset)
    clearAllData() {
        if (confirm('Are you sure you want to clear all data? This will reset your balance and transaction history.')) {
            localStorage.removeItem('cryptoMiner_balance');
            localStorage.removeItem('cryptoMiner_transactions');
            
            // Reset to initial state
            this.balance = 0.00000100;
            this.transactions = [{
                id: this.generateId(),
                description: 'Welcome Bonus',
                amount: 0.00000100,
                timestamp: new Date().toISOString(),
                type: 'bonus'
            }];
            
            this.stopMining();
            this.saveBalance();
            this.saveTransactions();
            this.loadTransactionHistory();
            this.updateDisplay();
            
            alert('All data has been cleared. Welcome bonus restored.');
        }
    }

    // Export data functionality (optional)
    exportData() {
        const data = {
            balance: this.balance,
            transactions: this.transactions,
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `cryptominer-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }
}

// Initialize the mining app when page loads
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new CryptoMiner();
});

// Make app globally available for the clear button
window.app = app;

// Optional: Add beforeunload event to save state when user leaves
window.addEventListener('beforeunload', () => {
    if (app && app.isMining) {
        app.addTransaction('Mining Session Ended', 0, 'info');
        app.saveBalance();
        app.saveTransactions();
    }
});
