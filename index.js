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
  if (timerID, flashID) {
    clearInterval(timerID)
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
      return
    }
    if (btn.innerHTML === 'START') {
      btn.innerHTML = 'PAUSE'
      const displayMin = document.querySelector(`#c${index + 1} .min`)
      const displaySec = document.querySelector(`#c${index + 1} .sec`)
      const [min, sec] = [
        displayMin.innerHTML,
        displaySec.innerHTML
      ].map(Number)
      let totalSec = min * 60 + sec
      timerID = setInterval(() => {
        if (totalSec > 0) {
          isPause = false
          totalSec--
          const newMin = String(Math.floor(totalSec / 60)).padStart(2, '0')
          const newSec = String(totalSec % 60).padStart(2, '0')
          displayMin.innerHTML = `${newMin}`
          displaySec.innerHTML = `${newSec}`
        } else {
          alarmSound.play()
          clearInterval(timerID)
          isPause = true
          btn.innerHTML = 'STOP'
          // flash the timer when time is up;
          const toFlash = document.querySelector(`#c${index + 1}`)
          flashID = setInterval(() => {
            toFlash.style.opacity = (toFlash.style.opacity === "1") ? "0" : "1"
          }, 800);
          // if its the work timer,display "let's take a break"; otherwise display "time to get productive!"
        }
      }, 1000)
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

