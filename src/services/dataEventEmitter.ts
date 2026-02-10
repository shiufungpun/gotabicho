// Simple event emitter for data changes
type DataChangeListener = () => void;

class DataEventEmitter {
    private listeners: DataChangeListener[] = [];

    subscribe(listener: DataChangeListener): () => void {
        this.listeners.push(listener);
        // Return unsubscribe function
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    emit(): void {
        this.listeners.forEach(listener => listener());
    }
}

export const dataChangeEmitter = new DataEventEmitter();

// Helper functions to trigger data refresh
export const notifyTripChange = () => {
    dataChangeEmitter.emit();
};

export const notifyReceiptChange = () => {
    dataChangeEmitter.emit();
};
