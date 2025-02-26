ZoteroClockTimer = {
    id: null,
    version: null,
    rootURI: null,
    initialized: false,
    addedElementIDs: [],
    timerInterval: null,
    countdownInterval: null,
    startTime: null,
    countdownTime: 0, // In seconds
    countdownRunning: false, // To track if countdown is running

    init({ id, version, rootURI }) {
        if (this.initialized) return;
        this.id = id;
        this.version = version;
        this.rootURI = rootURI;
        this.initialized = true;
    },

    log(msg) {
        Zotero.debug("Zotero Clock Timer: " + msg);
    },

    addToWindow(window) {
        let doc = window.document;
    
        // Create container
        let container = doc.createElement('div');
        container.id = 'zotero-clock-timer-container';
        container.style.position = 'absolute';
        container.style.bottom = '20px';
        container.style.left = '20px';
        container.style.padding = '12px';
        container.style.background = 'rgba(255, 255, 255, 0.15)';
        container.style.backdropFilter = 'blur(12px)';
        container.style.color = '#333';
        container.style.fontSize = '12px';
        container.style.borderRadius = '12px';
        container.style.boxShadow = '0px 4px 12px rgba(0, 0, 0, 0.2)';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.alignItems = 'center';
        container.style.cursor = 'grab';
        container.style.width = '220px';
        container.style.textAlign = 'center';
        container.style.userSelect = 'none';
    
        // Dragging functionality
        let isDragging = false, offsetX, offsetY;
    
        container.addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetX = e.clientX - container.getBoundingClientRect().left;
            offsetY = e.clientY - container.getBoundingClientRect().top;
            container.style.cursor = 'grabbing';
        });
    
        window.addEventListener('mousemove', (e) => {
            if (isDragging) {
                container.style.left = `${e.clientX - offsetX}px`;
                container.style.top = `${e.clientY - offsetY}px`;
            }
        });
    
        window.addEventListener('mouseup', () => {
            isDragging = false;
            container.style.cursor = 'grab';
        });
    
        // Clock Element
        let clockElem = doc.createElement('div');
        clockElem.id = 'zotero-clock';
        clockElem.textContent = 'Clock: --:--:--';
        clockElem.style.fontSize = '14px';
        clockElem.style.marginBottom = '6px';
        clockElem.style.color = '#222'; 

        container.appendChild(clockElem);
    
        // Timer Element
        let timerElem = doc.createElement('div');
        timerElem.id = 'zotero-timer';
        timerElem.textContent = 'Timer: 00:00:00';
        timerElem.style.marginBottom = '6px';
        timerElem.style.color = '#222'; 

        container.appendChild(timerElem);
    
        // Countdown Timer Element
        let countdownElem = doc.createElement('div');
        countdownElem.id = 'zotero-countdown';
        countdownElem.textContent = 'Countdown: 00:00:00';
        countdownElem.style.marginBottom = '6px';
        countdownElem.style.color = '#222'; 
        container.appendChild(countdownElem);
    
        // Countdown Time Input Fields
        let countdownInputs = doc.createElement('div');
        countdownInputs.style.display = 'flex';
        countdownInputs.style.justifyContent = 'center';
        countdownInputs.style.marginBottom = '6px';
    
        const createInput = (id, placeholder) => {
            let input = doc.createElement('input');
            input.id = id;
            input.type = 'number';
            input.min = 0;
            input.max = 59;
            input.placeholder = placeholder;
            input.style.width = '40px';
            input.style.padding = '5px';
            input.style.border = 'none';
            input.style.borderRadius = '6px';
            input.style.textAlign = 'center';
            input.style.margin = '0 3px';
            input.style.fontSize = '12px';
            input.style.background = 'rgba(255, 255, 255, 0.3)';
            input.style.color = '#222'; // Input text

            input.style.outline = 'none';
            return input;
        };
    
        let hourInput = createInput('zotero-countdown-hour', 'HH');
        let minuteInput = createInput('zotero-countdown-minute', 'MM');
        let secondInput = createInput('zotero-countdown-second', 'SS');
    
        countdownInputs.appendChild(hourInput);
        countdownInputs.appendChild(minuteInput);
        countdownInputs.appendChild(secondInput);
        container.appendChild(countdownInputs);
    
        // Buttons
        let buttonsContainer = doc.createElement('div');
        buttonsContainer.style.display = 'flex';
        buttonsContainer.style.justifyContent = 'center';
    
        const createButton = (id, text, callback) => {
            let button = doc.createElement('button');
            button.id = id;
            button.textContent = text;
            button.style.background = 'rgba(255, 255, 255, 0.3)';
            button.style.color = '#222'; // Button text
            button.style.border = 'none';
            button.style.borderRadius = '8px';
            button.style.padding = '6px 10px';
            button.style.margin = '4px';
            button.style.fontSize = '12px';
            button.style.cursor = 'pointer';
            button.style.transition = 'all 0.2s';
            button.addEventListener('mouseenter', () => {
                button.style.background = 'rgba(255, 255, 255, 0.5)';
            });
            button.addEventListener('mouseleave', () => {
                button.style.background = 'rgba(255, 255, 255, 0.3)';
            });
            button.addEventListener('click', () => callback(window, button));
            return button;
        };
    
        let startStopButton = createButton('zotero-countdown-start-stop', 'Start', this.toggleCountdown);
        let resetCountdownButton = createButton('zotero-countdown-reset', 'Reset Countdown', this.resetCountdown);
        let resetTimerButton = createButton('zotero-timer-reset', 'Reset Timer', this.resetTimer);
    
        buttonsContainer.appendChild(startStopButton);
        buttonsContainer.appendChild(resetCountdownButton);
        buttonsContainer.appendChild(resetTimerButton);
        container.appendChild(buttonsContainer);
    
        doc.documentElement.appendChild(container);
        this.storeAddedElement(container);
    
        this.startClock(window);
        this.startTimer(window);
        this.addKeyboardShortcut(window);
    },
    
    // addToWindow(window) {
    //     let doc = window.document;

    //     // Create container
    //     let container = doc.createElement('vbox');
    //     container.id = 'zotero-clock-timer-container';
    //     container.style.position = 'absolute';
    //     container.style.bottom = '5px';
    //     container.style.left = '5px';
    //     container.style.padding = '5px';
    //     container.style.background = 'rgba(255, 255, 255, 0.2)'; // Glassmorphism effect
    //     container.style.backdropFilter = 'blur(10px)';
    //     container.style.color = 'white';
    //     container.style.fontSize = '8px';
    //     container.style.borderRadius = '2px';

    //     // Clock Element
    //     let clockElem = doc.createElement('label');
    //     clockElem.id = 'zotero-clock';
    //     clockElem.textContent = 'Clock: --:--:--';
    //     container.appendChild(clockElem);

    //     // Timer Element
    //     let timerElem = doc.createElement('label');
    //     timerElem.id = 'zotero-timer';
    //     timerElem.style.marginRight = '2px';
    //     timerElem.textContent = 'Timer: 00:00:00';
    //     container.appendChild(timerElem);

    //     // Countdown Timer Element
    //     let countdownElem = doc.createElement('label');
    //     countdownElem.id = 'zotero-countdown';
    //     countdownElem.textContent = 'Countdown: 00:00:00';
    //     container.appendChild(countdownElem);

    //     // Countdown Time Input Fields
    //     let countdownInputs = doc.createElement('div');
    //     countdownInputs.style.marginTop = '2px';

    //     // Hour Input
    //     let hourInput = doc.createElement('input');
    //     hourInput.id = 'zotero-countdown-hour';
    //     hourInput.type = 'number';
    //     hourInput.min = 0;
    //     hourInput.max = 23;
    //     hourInput.placeholder = 'HH';
    //     hourInput.style.width = '20px';
    //     hourInput.style.marginRight = '5px';
    //     countdownInputs.appendChild(hourInput);

    //     // Minute Input
    //     let minuteInput = doc.createElement('input');
    //     minuteInput.id = 'zotero-countdown-minute';
    //     minuteInput.type = 'number';
    //     minuteInput.min = 0;
    //     minuteInput.max = 59;
    //     minuteInput.placeholder = 'MM';
    //     minuteInput.style.width = '20px';
    //     minuteInput.style.marginRight = '5px';
    //     countdownInputs.appendChild(minuteInput);

    //     // Second Input
    //     let secondInput = doc.createElement('input');
    //     secondInput.id = 'zotero-countdown-second';
    //     secondInput.type = 'number';
    //     secondInput.min = 0;
    //     secondInput.max = 59;
    //     secondInput.placeholder = 'SS';
    //     secondInput.style.width = '20px';
    //     countdownInputs.appendChild(secondInput);

    //     container.appendChild(countdownInputs);

    //     // Start/Stop Countdown Button
    //     let startStopButton = doc.createElement('button');
    //     startStopButton.id = 'zotero-countdown-start-stop';
    //     startStopButton.textContent = 'Start';
    //     startStopButton.style.marginLeft = '5px';
    //     startStopButton.style.cursor = 'pointer';
    //     startStopButton.style.fontSize = '8px';
    //     startStopButton.addEventListener('click', () => this.toggleCountdown(window, startStopButton));
    //     container.appendChild(startStopButton);

    //     // Reset Countdown Button
    //     let resetCountdownButton = doc.createElement('button');
    //     resetCountdownButton.id = 'zotero-countdown-reset';
    //     resetCountdownButton.textContent = 'Reset Countdown';
    //     resetCountdownButton.style.marginLeft = '5px';
    //     resetCountdownButton.style.cursor = 'pointer';
    //     resetCountdownButton.style.fontSize = '8px';
    //     resetCountdownButton.addEventListener('click', () => this.resetCountdown(window));
    //     container.appendChild(resetCountdownButton);

    //     // Reset Timer Button
    //     let resetButton = doc.createElement('button');
    //     resetButton.id = 'zotero-timer-reset';
    //     resetButton.textContent = 'Reset Timer';
    //     resetButton.style.marginLeft = '5px';
    //     resetButton.style.cursor = 'pointer';
    //     resetButton.style.fontSize = '8px';
    //     resetButton.addEventListener('click', () => this.resetTimer(window));
    //     container.appendChild(resetButton);

    //     doc.documentElement.appendChild(container);
    //     this.storeAddedElement(container);

    //     this.startClock(window);
    //     this.startTimer(window);
    //     this.addKeyboardShortcut(window);
    // },
    
    
    addToAllWindows() {
        let windows = Zotero.getMainWindows();
        for (let win of windows) {
            if (!win.ZoteroPane) continue;
            this.addToWindow(win);
        }
    },

    storeAddedElement(elem) {
        if (!elem.id) {
            throw new Error("Element must have an id");
        }
        this.addedElementIDs.push(elem.id);
    },

    removeFromWindow(window) {
        let doc = window.document;
        for (let id of this.addedElementIDs) {
            doc.getElementById(id)?.remove();
        }
    },

    removeFromAllWindows() {
        let windows = Zotero.getMainWindows();
        for (let win of windows) {
            if (!win.ZoteroPane) continue;
            this.removeFromWindow(win);
        }
    },

    startClock(window) {
        let clockElem = window.document.getElementById('zotero-clock');
        function updateClock() {
            let now = new Date();
            let timeStr = now.toLocaleTimeString();
            clockElem.textContent = `Clock: ${timeStr}`;
        }
        setInterval(updateClock, 1000);
        updateClock();
    },

    startTimer(window) {
        let timerElem = window.document.getElementById('zotero-timer');
        this.startTime = Date.now();

        function updateTimer() {
            let elapsed = Math.floor((Date.now() - ZoteroClockTimer.startTime) / 1000);
            let hours = String(Math.floor(elapsed / 3600)).padStart(2, '0');
            let minutes = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
            let seconds = String(elapsed % 60).padStart(2, '0');
            timerElem.textContent = `Timer: ${hours}:${minutes}:${seconds}`;
        }
        this.timerInterval = setInterval(updateTimer, 1000);
        updateTimer();
    },
    
    toggleCountdown(window, startStopButton) {
        let hourInput = window.document.getElementById('zotero-countdown-hour');
        let minuteInput = window.document.getElementById('zotero-countdown-minute');
        let secondInput = window.document.getElementById('zotero-countdown-second');
        let countdownElem = window.document.getElementById('zotero-countdown');
    
        if (this.countdownRunning) {
            // If the countdown is running, stop it
            this.countdownRunning = false;
            clearInterval(this.countdownInterval);
            startStopButton.textContent = 'Start';
        } else {
            // If the countdown is NOT running, only set countdownTime if it's not already counting down
            if (this.countdownTime === 0) {
                let hours = parseInt(hourInput.value) || 0;
                let minutes = parseInt(minuteInput.value) || 0;
                let seconds = parseInt(secondInput.value) || 0;
                this.countdownTime = hours * 3600 + minutes * 60 + seconds;
            }
    
            this.countdownRunning = true;
            this.countdownInterval = setInterval(() => {
                let countdownHours = String(Math.floor(this.countdownTime / 3600)).padStart(2, '0');
                let countdownMinutes = String(Math.floor((this.countdownTime % 3600) / 60)).padStart(2, '0');
                let countdownSeconds = String(this.countdownTime % 60).padStart(2, '0');
                countdownElem.textContent = `Countdown: ${countdownHours}:${countdownMinutes}:${countdownSeconds}`;
    
                if (this.countdownTime > 0) {
                    this.countdownTime--;
                } else {
                    clearInterval(this.countdownInterval);
                    this.countdownRunning = false;
                    startStopButton.textContent = 'Start';
                }
            }, 1000);
            startStopButton.textContent = 'Stop';
        }
    },
    // toggleCountdown(window, startStopButton) {
    //     // if (window.document.getElementById('zotero-countdown-hour').value ===0 && 
    //     //     window.document.getElementById('zotero-countdown-minute').value ===0 && 
    //     //     window.document.getElementById('zotero-countdown-second').value ===0 ){
    //     let hourInput = window.document.getElementById('zotero-countdown-hour');
    //     let minuteInput = window.document.getElementById('zotero-countdown-minute');
    //     let secondInput = window.document.getElementById('zotero-countdown-second');
    //         // }
    //     // Get input values
    //     let hours = parseInt(hourInput.value) || 0;
    //     let minutes = parseInt(minuteInput.value) || 0;
    //     let seconds = parseInt(secondInput.value) || 0;

    //     // Set countdown time in seconds
    //     this.countdownTime = hours * 3600 + minutes * 60 + seconds;

    //     if (this.countdownRunning) {
    //         this.countdownRunning = false;
    //         clearInterval(this.countdownInterval);
    //         startStopButton.textContent = 'Start';
    //     } else {
    //         this.countdownRunning = true;
    //         let countdownElem = window.document.getElementById('zotero-countdown');
    //         this.countdownInterval = setInterval(() => {
    //             let countdownHours = String(Math.floor(this.countdownTime / 3600)).padStart(2, '0');
    //             let countdownMinutes = String(Math.floor((this.countdownTime % 3600) / 60)).padStart(2, '0');
    //             let countdownSeconds = String(this.countdownTime % 60).padStart(2, '0');
    //             countdownElem.textContent = `Countdown: ${countdownHours}:${countdownMinutes}:${countdownSeconds}`;

    //             if (this.countdownTime > 0) {
    //                 this.countdownTime--;
    //             } else {
    //                 clearInterval(this.countdownInterval);
    //                 this.countdownRunning = false;
    //                 startStopButton.textContent = 'Start';
    //             }
    //         }, 1000);
    //         startStopButton.textContent = 'Stop';
    //     }
    // },

    resetCountdown(window) {
        this.countdownRunning = false;
        clearInterval(this.countdownInterval);
        this.countdownTime = 0;
        let countdownElem = window.document.getElementById('zotero-countdown');
        countdownElem.textContent = `Countdown: 00:00:00`;

        let startStopButton = window.document.getElementById('zotero-countdown-start-stop');
        startStopButton.textContent = 'Start';
    },

    resetTimer(window) {
        this.startTime = Date.now();
        let timerElem = window.document.getElementById('zotero-timer');
        timerElem.textContent = `Timer: 00:00:00`;
    },

    addKeyboardShortcut(window) {
        window.addEventListener('keydown', (event) => {
            if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'R') {
                event.preventDefault();
                this.resetTimer(window);
            }
        });
    }
};



// ZoteroClockTimer = {
//     id: null,
//     version: null,
//     rootURI: null,
//     initialized: false,
//     addedElementIDs: [],
//     timerInterval: null,
//     startTime: null,

//     init({ id, version, rootURI }) {
//         if (this.initialized) return;
//         this.id = id;
//         this.version = version;
//         this.rootURI = rootURI;
//         this.initialized = true;
//     },

//     log(msg) {
//         Zotero.debug("Zotero Clock Timer: " + msg);
//     },

//     addToWindow(window) {
//         let doc = window.document;

//         // Create container
//         let container = doc.createElement('vbox');
//         container.id = 'zotero-clock-timer-container';
//         container.style.position = 'absolute';
//         container.style.top = '10px';
//         container.style.right = '10px';
//         container.style.padding = '10px';
//         container.style.background = 'rgba(0,0,0,0.65)';
//         container.style.color = 'white';
//         container.style.fontSize = '14px';
//         container.style.borderRadius = '5px';

//         // Clock Element
//         let clockElem = doc.createElement('label');
//         clockElem.id = 'zotero-clock';
//         clockElem.textContent = 'Clock: --:--:--';
//         container.appendChild(clockElem);

//         // Timer Element
//         let timerElem = doc.createElement('label');
//         timerElem.id = 'zotero-timer';
//         timerElem.style.marginRight = '5px';
//         timerElem.textContent = '\nTimer: 00:00:00';
//         container.appendChild(timerElem);

//         // Reset Button
//         let resetButton = doc.createElement('button');
//         resetButton.id = 'zotero-timer-reset';
//         resetButton.textContent = 'Reset';
//         resetButton.style.marginLeft = '5px';
//         resetButton.style.cursor = 'pointer';
//         resetButton.style.fontSize = '12px';
//         resetButton.addEventListener('click', () => this.resetTimer(window));
//         container.appendChild(resetButton);

//         doc.documentElement.appendChild(container);
//         this.storeAddedElement(container);

//         this.startClock(window);
//         this.startTimer(window);
//         this.addKeyboardShortcut(window);
//     },

//     addToAllWindows() {
//         let windows = Zotero.getMainWindows();
//         for (let win of windows) {
//             if (!win.ZoteroPane) continue;
//             this.addToWindow(win);
//         }
//     },

//     storeAddedElement(elem) {
//         if (!elem.id) {
//             throw new Error("Element must have an id");
//         }
//         this.addedElementIDs.push(elem.id);
//     },

//     removeFromWindow(window) {
//         let doc = window.document;
//         for (let id of this.addedElementIDs) {
//             doc.getElementById(id)?.remove();
//         }
//     },

//     removeFromAllWindows() {
//         let windows = Zotero.getMainWindows();
//         for (let win of windows) {
//             if (!win.ZoteroPane) continue;
//             this.removeFromWindow(win);
//         }
//     },

//     startClock(window) {
//         let clockElem = window.document.getElementById('zotero-clock');
//         function updateClock() {
//             let now = new Date();
//             let timeStr = now.toLocaleTimeString();
//             clockElem.textContent = `Clock: ${timeStr}`;
//         }
//         setInterval(updateClock, 1000);
//         updateClock();
//     },

//     startTimer(window) {
//         let timerElem = window.document.getElementById('zotero-timer');
//         this.startTime = Date.now();

//         function updateTimer() {
//             let elapsed = Math.floor((Date.now() - ZoteroClockTimer.startTime) / 1000);
//             let hours = String(Math.floor(elapsed / 3600)).padStart(2, '0');
//             let minutes = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
//             let seconds = String(elapsed % 60).padStart(2, '0');
//             timerElem.textContent = `Timer: ${hours}:${minutes}:${seconds}`;
//         }
//         this.timerInterval = setInterval(updateTimer, 1000);
//         updateTimer();
//     },

//     resetTimer(window) {
//         this.startTime = Date.now();
//         let timerElem = window.document.getElementById('zotero-timer');
//         timerElem.textContent = `Timer: 00:00:00`;
//     },

//     addKeyboardShortcut(window) {
//         window.addEventListener('keydown', (event) => {
//             if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'R') {
//                 event.preventDefault();
//                 this.resetTimer(window);
//             }
//         });
//     }
// };
