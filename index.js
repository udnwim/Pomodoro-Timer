function highlightText(element) {
  const range = document.createRange()
  //select all the content inside the element vv
  range.selectNodeContents(element)
  const selection = window.getSelection()
  // remove existing selections
  selection.removeAllRanges()
  selection.addRange(range)
}

// number: 1 to the next section, -1 to the previous
function switchEnterSection(nodeList, index, number) {
  const whereTo = nodeList[index + number]
  whereTo.contentEditable = 'true'
  whereTo.focus()
  highlightText(whereTo)
}

//quickly select the displayed counting number
function selectContainer(containerIndex) {
  const displayMin = document.querySelector(`#c${containerIndex + 1} .min`)
  const displaySec = document.querySelector(`#c${containerIndex + 1} .sec`)
  return [displayMin, displaySec]
}

//quickly change the innerHTML of a selected element
function btnHTML(eleSelector, text) {
  document.querySelector(eleSelector).innerHTML = String(text)
}

//index = of all the selected start/reset buttons; (index + 1) locates the id of the target element(#c1, #c2, #r1, #r2...)
function reset(index) {
  if (timerID) clearInterval(timerID)
  if (flashID) {
    document.querySelector(`#c${index + 1}`).style.opacity = '1'
    clearInterval(flashID)
  }
  
  btnHTML(`#s${index + 1}`, 'START')
  alarmSound.currentTime = 0
  alarmSound.pause()
  const [min, sec] = selectContainer(index)
  if (index === 0) {
    [min.innerHTML, sec.innerHTML] = [timerRecord[0], timerRecord[1]]
  } else {
    [min.innerHTML, sec.innerHTML] = [timerRecord[2], timerRecord[3]]
  }
}

// two timer: default set as 45:00, 15:00. workTimer gets [45, 00, 15, 00]
const workTimer = document.querySelectorAll('.countdown div')
let timerRecord = []
// vv get the min and sec of alarms and store them to the timerRecord array
workTimer.forEach((timer, index) => {
  timerRecord[index] = timer.innerHTML
})

// editable timer
workTimer.forEach((timer, index) => {
  timer.addEventListener('click', () => {
    timer.contentEditable = 'true'
    timer.focus()
    highlightText(timer)
  })
  // when use press "tab" key in editing, switch to the next div
  timer.addEventListener('keydown', (e) => {
    if (e.key === 'Tab' && timer.contentEditable) {
      e.preventDefault()
      //if user only input one number and hit 'tab', add a 0 to the beginning
      if (timer.innerHTML.length === 1) {
        timerRecord[index] = timer.innerHTML.padStart(2, '0')
        timer.innerHTML = timerRecord[index]
        console.log(timerRecord)
      }
      
      if (index < 3) {
        switchEnterSection(workTimer, index, 1)
      }
    }
  })
  // when use a combination of "shift + tab" is pressed in editing, switch to the previous div
  timer.addEventListener('keydown', (e) => {
    if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault()
      console.log(index)
      
      if (index > 0) {
        switchEnterSection(workTimer, index, -1)
      }
    }
  })
  timer.addEventListener('blur', () => {
    timer.contentEditable = 'false'
  })
  //limit the input to 2 digits
  timer.addEventListener('input', () => {
    // anything besides digits will be omit
    let digitOnly = timer.textContent.replace(/[^\d]/g,'')
    timer.textContent = digitOnly
    // switch to the next editing section after the second digit is entered. when index === 3, cut the third digit
    if (digitOnly.length >= 2) {
      if (index === 3) {
        timer.textContent = timer.textContent.slice(0, 2)
        highlightText(timer)
        timerRecord[index] = timer.textContent
        console.log(timerRecord)
        return
      }
      timerRecord[index] = timer.textContent
      switchEnterSection(workTimer, index, 1)
      console.log(timerRecord)
    }
  })
})

// start|pause timer
const mainBtns = document.querySelectorAll('.main')
const resetBtns = document.querySelectorAll('.resetBtn')
let isPause = true
let timerID, flashID

// when the button is hit, and the timer is not running(isPause=true), get the current display number and start counting down; otherwise reverse the flag and stop the counter
const alarmSound = new Audio('./lib/ambient-piano-music-1.wav')
mainBtns.forEach((btn, index) => {
  btn.addEventListener('click', () => {
    if (btn.innerHTML === 'STOP') {
      reset(index, 'START')
      //when the time is up and the stop button is hit, check which timer is displaying and switch visibility
      const timerW = document.querySelector('.workTimer')
      const timerR = document.querySelector('.relaxTimer')
      const quote = document.querySelector('.quote')
      const displayW = getComputedStyle(timerW).display
      if (displayW === 'flex') {
        timerW.style.display = 'none'
        timerR.style.display = 'flex'
      } else {
        timerW.style.display = 'flex'
        timerR.style.display = 'none'
        quote.innerHTML = "Let's take a break!"
      }
      return
    }
    if (btn.innerHTML === 'START') {
      btn.innerHTML = 'PAUSE'
      const displayMin = document.querySelector(`#c${index + 1} .min`)
      const displaySec = document.querySelector(`#c${index + 1} .sec`)
      // const [min, sec] = [
      //   displayMin.innerHTML,
      //   displaySec.innerHTML
      // ].map(Number)

      // current timestamp + timer convert to ms = alarm timestamp
      const getTime = (Number(timerRecord[index * 2]) * 60 + Number(timerRecord[index * 2 + 1])) * 1000
      const end = Date.now() + getTime
      timerID = setInterval(() => {
        //sometimes timestamp we get from Date.now() can be larger than the real time due to lagging from cpu, browser, etc; Causing thr result being negative. use math.max to avoid it
        const remainSec = Math.max(0, Math.round((end - Date.now()) / 1000))
        console.log(remainSec)
        const newMin = String(Math.floor(remainSec / 60)).padStart(2, '0')
        const newSec = String(remainSec % 60).padStart(2, '0')
        displayMin.innerHTML = newMin
        displaySec.innerHTML = newSec
        
        if (remainSec === 0) {
          alarmSound.play()
          clearInterval(timerID)
          isPause = true
          btn.innerHTML = 'STOP'
          const toFlash = document.querySelector(`#c${index + 1}`)
          flashID = setInterval(() => {
            toFlash.style.opacity = (toFlash.style.opacity === "1") ? "0" : "1" 
          }, 800);
        }
      }, 1000);
      // if its the work timer,display "let's take a break"; otherwise display "time to get productive!"
      // ticking in <title>?
      //bug: two timer can not work separetly (maybe just stack them into one container)
      // add inspiring sentences to this website(API)
      // add dark/light theme switch button
    } else {
      btn.innerHTML = 'START'
      clearInterval(timerID)
      isPause = true
    }
  })
})

//reset button
resetBtns.forEach((btn, index) => {
  btn.addEventListener('click', () => {
    reset(index)
  })
})

// day/night mode toggle
const themeToggle = document.querySelector('.switchWrapper .slider')
const switchContainer = document.querySelector('.switchWrapper')
const body = document.body
let isDarkMode = false
switchContainer.addEventListener('click', () => {
  if (isDarkMode) {
    themeToggle.style.transform = "translateX(0px)"
    switchContainer.style.backgroundColor = '#170B3B'
    if (body.classList.contains('dark')) {
      body.classList.replace('dark', 'light')
    } else {
      body.classList.add('light')
    }
    isDarkMode = false
  } else {
    themeToggle.style.transform = "translateX(20px)"
    switchContainer.style.backgroundColor = '#9388A2'
    if (body.classList.contains('light')) {
      body.classList.replace('light', 'dark')
    } else {
      body.classList.add('dark')
    }
    isDarkMode = true
  }
})