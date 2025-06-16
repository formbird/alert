import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import Swal from '../src/index'

describe('SweetAlert2', () => {
  beforeEach(() => {
    // Reset any previous state
    Swal.close()
  })

  afterEach(() => {
    // Clean up after each test
    Swal.close()
  })

  it('modal shows up', () => {
    expect(Swal.version).toMatch(/\d+\.\d+\.\d+/)
    expect(Swal.isVisible()).toBe(false)
    Swal.fire('Hello world!')
    expect(Swal.isVisible()).toBe(true)
  })

  it('modal width', () => {
    Swal.fire({ text: '400px', width: 300 })
    expect(document.querySelector('.swal2-modal').style.width).toBe('300px')

    Swal.fire({ text: '500px', width: '400px' })
    expect(document.querySelector('.swal2-modal').style.width).toBe('300px')

    Swal.fire({ text: '90%', width: '90%' })
    expect(document.querySelector('.swal2-modal').style.width).toBe('300px')

    Swal.fire({ text: 'default width' })
    expect(document.querySelector('.swal2-modal').style.width).toBe('300px')
  })

  it('window keydown handler', () => {
    Swal.fire('hi')
    expect(window.onkeydown.toString()).toMatch('function handleKeyDown')
    Swal.close()
    expect(window.onkeydown).toBeNull()

    Swal.fire('first call')
    Swal.fire('second call')
    expect(window.onkeydown.toString()).toMatch('function handleKeyDown')
    Swal.close()
    expect(window.onkeydown).toBeNull()
  })

  it('getters', () => {
    Swal.fire('Title', 'Content')
    expect(Swal.getTitle().innerText).toBe('Title')
    expect(Swal.getContent().innerText).toBe('Content')

    Swal.fire({
      showCancelButton: true,
      imageUrl: 'image.png',
      confirmButtonText: 'Confirm button',
      cancelButtonText: 'Cancel button'
    })
    expect(Swal.getImage().src).toContain('image.png')
    expect(Swal.getConfirmButton().innerText).toBe('Confirm button')
    expect(Swal.getCancelButton().innerText).toBe('Cancel button')

    Swal.fire({ input: 'text' })
    document.querySelector('.swal2-input').value = 'input text'
    expect(Swal.getInput().value).toBe('input text')

    Swal.fire({
      input: 'radio',
      inputOptions: {
        'one': 'one',
        'two': 'two'
      }
    })
    document.querySelector('.swal2-radio input[value="two"]').checked = true
    expect(Swal.getInput().value).toBe('two')
  })

  it('confirm button', async () => {
    const result = await Swal.fire('Confirm me').then(() => {
      Swal.clickConfirm()
    })
    expect(result).toBe(true)
  })

  it('custom buttons classes', () => {
    Swal.fire({
      text: 'Modal with custom buttons classes',
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-warning'
    })
    expect(document.querySelector('.swal2-confirm').classList.contains('btn')).toBe(true)
    expect(document.querySelector('.swal2-confirm').classList.contains('btn-success')).toBe(true)
    expect(document.querySelector('.swal2-cancel').classList.contains('btn')).toBe(true)
    expect(document.querySelector('.swal2-cancel').classList.contains('btn-warning')).toBe(true)

    Swal.fire('Modal with default buttons classes')
    expect(document.querySelector('.swal2-confirm').classList.contains('btn')).toBe(false)
    expect(document.querySelector('.swal2-confirm').classList.contains('btn-success')).toBe(false)
    expect(document.querySelector('.swal2-cancel').classList.contains('btn')).toBe(false)
    expect(document.querySelector('.swal2-cancel').classList.contains('btn-warning')).toBe(false)
  })

  it('cancel button', async () => {
    const result = await Swal.fire('Cancel me').then(
      () => {},
      (dismiss) => {
        Swal.clickCancel()
        return dismiss
      }
    )
    expect(result).toBe('cancel')
  })

  it('esc key', async () => {
    const result = await Swal.fire('Esc me').then(
      () => {},
      (dismiss) => {
        document.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 27 }))
        return dismiss
      }
    )
    expect(result).toBe('esc')
  })

  it('timer works', async () => {
    const result = await Swal.fire({
      title: 'Timer test',
      timer: 10,
      animation: false
    }).then(
      () => {},
      (dismiss) => dismiss
    )
    expect(result).toBe('timer')
  })

  it('close button', async () => {
    const result = await Swal.fire({
      title: 'Close button test',
      showCloseButton: true
    }).then(
      () => {},
      (dismiss) => {
        document.querySelector('.swal2-close').click()
        return dismiss
      }
    )
    expect(result).toBe('close')
  })

  it('content/title is set (html)', () => {
    Swal.fire({
      title: '<strong>Strong</strong>, <em>Emphasis</em>',
      html: '<p>Paragraph</p><img /><button></button>'
    })

    expect(document.querySelectorAll('.swal2-title strong, .swal2-title em').length).toBe(2)
    expect(document.querySelectorAll('.swal2-content p, .swal2-content img, .swal2-content button').length).toBe(3)
  })

  it('content/title is set (text)', () => {
    Swal.fire({
      titleText: '<strong>Strong</strong>, <em>Emphasis</em>',
      text: '<p>Paragraph</p><img /><button></button>'
    })

    expect(document.querySelector('.swal2-title').textContent).toBe('<strong>Strong</strong>, <em>Emphasis</em>')
    expect(document.querySelector('.swal2-content').textContent).toBe('<p>Paragraph</p><img /><button></button>')
    expect(document.querySelectorAll('.swal2-title strong, .swal2-title em').length).toBe(0)
    expect(document.querySelectorAll('.swal2-content p, .swal2-content img, .swal2-content button').length).toBe(0)
  })

  it('input text', async () => {
    const string = 'Live for yourself'
    const result = await Swal.fire({ input: 'text' }).then(() => {
      document.querySelector('.swal2-input').value = string
      Swal.clickConfirm()
    })
    expect(result).toBe(string)
  })

  it('built-in email validation', async () => {
    const validEmailAddress = 'team+support+a.b@example.com'
    const result = await Swal.fire({ input: 'email', animation: false }).then(() => {
      document.querySelector('.swal2-input').value = validEmailAddress
      Swal.clickConfirm()
    })
    expect(result).toBe(validEmailAddress)
  })

  it('input select', async () => {
    const selected = 'dos'
    const result = await Swal.fire({
      input: 'select',
      inputOptions: { uno: 1, dos: 2 }
    }).then(() => {
      document.querySelector('.swal2-select').value = selected
      Swal.clickConfirm()
    })
    expect(result).toBe(selected)
  })

  it('input checkbox', async () => {
    const result = await Swal.fire({
      input: 'checkbox',
      inputAttributes: { name: 'test-checkbox' }
    }).then(() => {
      const checkbox = document.querySelector('.swal2-checkbox input')
      checkbox.checked = true
      Swal.clickConfirm()
    })
    expect(result).toBe('1')
  })

  it('input range', () => {
    Swal.fire({
      input: 'range',
      inputAttributes: { min: 1, max: 10 },
      inputValue: 5
    })
    const input = document.querySelector('.swal2-range input')
    expect(input.getAttribute('min')).toBe('1')
    expect(input.getAttribute('max')).toBe('10')
    expect(input.value).toBe('5')
  })

  it('showLoading and hideLoading', () => {
    Swal.showLoading()
    expect(document.querySelector('.swal2-buttonswrapper').classList.contains('swal2-loading')).toBe(true)
    expect(document.querySelector('.swal2-cancel').disabled).toBe(true)

    Swal.hideLoading()
    expect(document.querySelector('.swal2-buttonswrapper').classList.contains('swal2-loading')).toBe(false)
    expect(document.querySelector('.swal2-cancel').disabled).toBe(false)

    Swal.fire({
      title: 'test loading state',
      showConfirmButton: false
    })

    Swal.showLoading()
    expect(document.querySelector('.swal2-buttonswrapper').style.display).not.toBe('none')
    expect(document.querySelector('.swal2-buttonswrapper').classList.contains('swal2-loading')).toBe(true)

    Swal.hideLoading()
    expect(document.querySelector('.swal2-buttonswrapper').style.display).toBe('none')
    expect(document.querySelector('.swal2-buttonswrapper').classList.contains('swal2-loading')).toBe(false)
  })

  it('disable/enable buttons', () => {
    Swal.fire('test disable/enable buttons')

    Swal.disableButtons()
    expect(document.querySelector('.swal2-confirm').disabled).toBe(true)
    expect(document.querySelector('.swal2-cancel').disabled).toBe(true)

    Swal.enableButtons()
    expect(document.querySelector('.swal2-confirm').disabled).toBe(false)
    expect(document.querySelector('.swal2-cancel').disabled).toBe(false)

    Swal.disableConfirmButton()
    expect(document.querySelector('.swal2-confirm').disabled).toBe(true)

    Swal.enableConfirmButton()
    expect(document.querySelector('.swal2-confirm').disabled).toBe(false)
  })

  it('input radio', () => {
    Swal.fire({
      input: 'radio',
      inputOptions: {
        'one': 'one',
        'two': 'two'
      }
    })

    expect(document.querySelectorAll('.swal2-radio label').length).toBe(2)
    expect(document.querySelectorAll('.swal2-radio input[type="radio"]').length).toBe(2)
  })

  it('disable/enable input', () => {
    Swal.fire({
      input: 'text'
    })

    Swal.disableInput()
    expect(document.querySelector('.swal2-input').disabled).toBe(true)
    Swal.enableInput()
    expect(document.querySelector('.swal2-input').disabled).toBe(false)

    Swal.fire({
      input: 'radio',
      inputOptions: {
        'one': 'one',
        'two': 'two'
      }
    })

    Swal.disableInput()
    document.querySelectorAll('.swal2-radio input[type="radio"]').forEach(radio => {
      expect(radio.disabled).toBe(true)
    })
    Swal.enableInput()
    document.querySelectorAll('.swal2-radio input[type="radio"]').forEach(radio => {
      expect(radio.disabled).toBe(false)
    })
  })

  it('default focus', async () => {
    Swal.fire('Modal with the Confirm button only')
    expect(document.activeElement).toBe(document.querySelector('.swal2-confirm'))

    Swal.fire({
      text: 'Modal with two buttons',
      showCancelButton: true
    })
    expect(document.activeElement).toBe(document.querySelector('.swal2-confirm'))

    Swal.fire({
      text: 'Modal with an input',
      input: 'text'
    })
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(document.activeElement).toBe(document.querySelector('.swal2-input'))
  })

  it('reversed buttons', () => {
    Swal.fire({
      text: 'Modal with reversed buttons',
      reverseButtons: true
    })
    const confirmIndex = Array.from(document.querySelector('.swal2-actions').children).indexOf(document.querySelector('.swal2-confirm'))
    const cancelIndex = Array.from(document.querySelector('.swal2-actions').children).indexOf(document.querySelector('.swal2-cancel'))
    expect(confirmIndex - cancelIndex).toBe(1)

    Swal.fire('Modal with buttons')
    const confirmIndex2 = Array.from(document.querySelector('.swal2-actions').children).indexOf(document.querySelector('.swal2-confirm'))
    const cancelIndex2 = Array.from(document.querySelector('.swal2-actions').children).indexOf(document.querySelector('.swal2-cancel'))
    expect(cancelIndex2 - confirmIndex2).toBe(1)
  })

  it('focus cancel', () => {
    Swal.fire({
      text: 'Modal with Cancel button focused',
      showCancelButton: true,
      focusCancel: true
    })
    expect(document.activeElement).toBe(document.querySelector('.swal2-cancel'))
  })

  it('image custom class', () => {
    Swal.fire({
      text: 'Custom class is set',
      imageUrl: 'image.png',
      imageClass: 'image-custom-class'
    })
    expect(document.querySelector('.swal2-image').classList.contains('image-custom-class')).toBe(true)

    Swal.fire({
      text: 'Custom class isn\'t set',
      imageUrl: 'image.png'
    })
    expect(document.querySelector('.swal2-image').classList.contains('image-custom-class')).toBe(false)
  })

  it('params validation', () => {
    expect(Swal.isValidParameter('title')).toBe(true)
    expect(Swal.isValidParameter('foobar')).toBe(false)
  })
}) 