export class VoiceCommand {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.onCommand = null;
        this.onStatusChange = null;
    }

    init() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.error('Web Speech API not supported');
            this.updateStatus('not-supported');
            return false;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'ko-KR';
        this.recognition.continuous = true;
        this.recognition.interimResults = true;

        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateStatus('listening');
        };

        this.recognition.onend = () => {
            this.isListening = false;
            if (this.shouldRestart) {
                this.recognition.start();
            } else {
                this.updateStatus('stopped');
            }
        };

        this.recognition.onresult = (event) => {
            const results = event.results;
            const latestResult = results[results.length - 1];

            if (latestResult.isFinal || latestResult[0].confidence > 0.7) {
                const transcript = latestResult[0].transcript.trim().toLowerCase();
                this.processCommand(transcript);
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            if (event.error === 'no-speech') {
                this.updateStatus('no-speech');
            } else if (event.error === 'not-allowed') {
                this.updateStatus('permission-denied');
            }
        };

        return true;
    }

    start() {
        if (!this.recognition) {
            const initialized = this.init();
            if (!initialized) return false;
        }

        try {
            this.shouldRestart = true;
            this.recognition.start();
            return true;
        } catch (e) {
            console.error('Failed to start recognition:', e);
            return false;
        }
    }

    stop() {
        this.shouldRestart = false;
        if (this.recognition) {
            this.recognition.stop();
        }
    }

    processCommand(transcript) {
        if (!this.onCommand) return;

        const jumpPatterns = ['점프', '뛰어', 'jump'];
        const attackPatterns = ['공격', '공격해', 'attack', '파이어볼', '발사'];

        for (const pattern of jumpPatterns) {
            if (transcript.includes(pattern)) {
                this.onCommand('jump');
                return;
            }
        }

        for (const pattern of attackPatterns) {
            if (transcript.includes(pattern)) {
                this.onCommand('attack');
                return;
            }
        }
    }

    setCommandCallback(callback) {
        this.onCommand = callback;
    }

    setStatusCallback(callback) {
        this.onStatusChange = callback;
    }

    updateStatus(status) {
        if (this.onStatusChange) {
            this.onStatusChange(status);
        }
    }
}
