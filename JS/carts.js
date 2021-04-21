import { domain } from '../api/api.js'
const progress = document.querySelectorAll('.progress_logo');
const validateWrap = document.querySelector('.validateWrap');
const sendCarts = document.querySelector('.sendCarts button');
const cartsList = document.querySelector('.cartsList');
const cartsTotal = document.querySelector('.cartsTotal');
const deleteAll = document.querySelector('.js-deleteAll');
const validateMessage = document.querySelectorAll('.validate-message');
const sendOrderBtn = document.querySelector('.sendOrder');
const finishWrap = document.querySelector('.finishWrap');

let cartsData = []
// 取得購物車資訊
export async function getCarts() {
    const getCarts = await domain.get('/carts')
    cartsData = getCarts.data.carts
    cartsTotal.textContent = `NT$ ${getCarts.data.finalTotal}`
    render()

    // 計算購物車數量，要在執行 render 後才執行這樣才取得到 DOM 元素
    const addBtns = document.querySelectorAll('.addQty');
    addBtns.forEach((item) => {
        item.addEventListener('click', function(e) {
            const status = 'add'
            btnUpdateQty(status, e)
        })
    })
    const removeBtns = document.querySelectorAll('.minQty')
    removeBtns.forEach((item) => {
        item.addEventListener('click', function(e) {
            const status = 'remove'
            btnUpdateQty(status, e)
        })
    })
    const inputQty = document.querySelectorAll('.CartsQty')
    inputQty.forEach((item) => {
        const originVal = item.value
        const id = item.id
        item.addEventListener('blur', (e) =>{
            modifyQty(originVal, id, e)
        })
    })
}
getCarts()

// 渲染購物車
function render () {
    let str = ''
    cartsData.forEach((item) => {
        str += `<tr>
                    <td class="d-flex align-items-center p-4">
                        <img src="${item.product.images}" alt="" class="mr-5">
                        <h4>${item.product.title}</h4>
                    </td>
                    <td class="p-4">
                        <p class="mb-0">${item.product.price}</p>
                    </td>
                    <td class="quantity p-2">
                        <div class="d-flex align-items-center">
                            <button class="minQty" data-id="${item.id}">-</button>
                            <input class="CartsQty mb-0 text-center w-50 border-0" id="${item.id}" value="${item.quantity}">
                            <button class="addQty" data-id="${item.id}">+</button>
                        </div>
                    </td>
                    <td class="p-4">
                        <p class="mb-0">${item.product.price * item.quantity}</p>
                    </td>
                    <td class="p-4">
                      <button class="deleteSingleBtn border-0">
                        <i class="fas fa-times" id="js-delete" data-id="${item.id}"></i>
                      </button>
                    </td>
                </tr>`
    })
    cartsList.innerHTML = str
}
// 刪除單一購物車商品
async function deleteCarts(e) {
    e.stopPropagation()
    const deletBtn = e.target.getAttribute('id')
    if( deletBtn !== 'js-delete'){
        return
    }
    const id = e.target.getAttribute('data-id')
    console.log(id);
    const deleteSingleCarts = await domain.delete(`/carts/${id}`)
    getCarts()
}

//刪除全部購物車商品
async function deleteAllCarts (e) {
  e.preventDefault()
  const deleteAll = await domain.delete('/carts')
  getCarts()
}
async function btnUpdateQty (status, e) {
    const id = e.target.dataset.id
    let num = Number(document.getElementById(`${id}`).value)
    if (status === 'add') {
        num += 1
        console.log(num);
    } else if (status === 'remove' && num > 1) {
        num -= 1
        console.log(num);
    }
    let data = {
        data: {
            id: id,
            quantity: num
        }
    }
    const btnUpdateQty = await domain.patch('/carts', data)
    console.log(btnUpdateQty);
    getCarts()
}
// 更改購物車商品數量
async function modifyQty (originVal, id, e) {
    const modifyVal = Number(e.target.value)
    if(originVal !== modifyVal) {
        let data = {
            data: {
                id: id,
                quantity: modifyVal
            }
        }
        const modifyUpdate = await domain.patch('/carts', data)
    }
    getCarts()
}

// 欄位驗證判斷
//presence 必填
const formInputs = document.querySelectorAll('.form-control');
const orderForm = document.querySelector('.orderForm');
let constraints = {
    '姓名': {
        presence: {
          message: "必填欄位"
        }
    },
    '電話': {
        presence: {
          message: "必填欄位"
        },
        length: {
            minimum: 10,
            message: "must be at least 10 characters"
        }
    },
    'Email': {
        presence: {
          message: "必填欄位"
        },
        email: {
          message: "格式錯誤"
        }
    },
    '寄送地址': {
        presence: {
          message: "必填欄位"
        }
    },
    '交易方式': {
        presence: {
          message: "必填欄位"
        }
    },
};
formInputs.forEach((item) => {
    item.addEventListener('blur', function() {
        item.nextElementSibling.textContent = '';
        let errors = validate(orderForm, constraints) || '';
        if (errors) {
          Object.keys(errors).forEach((keys) => {
            const errorsInput = document.querySelector(`[data-message="${keys}"]`)
            errorsInput.textContent = errors[keys]
          })
        }
    })
})
// 送出表單資訊
function sendOrder(e) {
    e.preventDefault()
    const orderName = document.getElementById('orderName').value
    const orderPhone = document.getElementById('orderPhone').value
    const orderEmail = document.getElementById('orderEmail').value
    const orderAddress = document.getElementById('orderAddress').value
    const orderTrade = document.getElementById('orderTrade').value
    let error = []
    validateMessage.forEach((item) =>{
        if(item.textContent !== ''){
            error.push(item.textContent)
        }
    })
    if(cartsData.length === 0){
        alert('購物車不得為空')
        return
    }
    if(orderName === '' || orderPhone === '' || orderEmail === '' || orderAddress === '' ||
    orderTrade === '' || error.length !== 0){
        alert('請填寫正確資訊')
        return
    }
    if(error.length === 0){
        let data = {
            'data': {
                'user': {
                    "name": orderName,
                    "tel": orderPhone,
                    "email": orderEmail,
                    "address": orderAddress,
                    "payment": orderTrade
                }
            }
        }
        const orderPost = domain.post('/orders', data)
        progressStep()
    }
    if(cartsData.length === 0){
        return
    }else{
        gsap.to('.validateWrap', { duration: 1, x: -200, opacity: 0, display: 'none' })
        gsap.from('.fini', { duration: 1, x: 200, opacity: 0 }).delay(1.5)
        gsap.to('.validateWrap', { duration: 1, x: 0, opacity: 1 }).delay(1.5)
        finishWrap.classList.remove('d-none')
        gsap.from('.finishWrap', { duration: 1, x: 200, opacity: 0 }).delay(1.5)
        gsap.to('.finishWrap', { duration: 1, x: 0, opacity: 1 }).delay(1.5)
    }
}
// 進度條效果
let nowStep = 1 // 目前進度
function progressStep () {
    nowStep++
    console.log(nowStep);
    const secondBar = document.getElementById('progress_finish_sec')
    const thridBar = document.getElementById('progress_finish_thrid')
    console.log(secondBar, thridBar);
    progress.forEach((item) => {
        const step = item.getAttribute('data-step')
        if(nowStep === 2 && step === '2'){
            item.style.background = '#49CC90'
            secondBar.style.animation = 'barSpeed 2s forwards'
        }
        if(nowStep === 3 && step === '3'){
            item.style.background = '#49CC90'
            thridBar.style.animation = 'barSpeed 2s forwards'
        }
    })
}

// 送出購物車動畫效果
sendCarts.addEventListener('click', function() {
    if(cartsData.length === 0){
        alert('購物車不得為空')
        return
    }
    if(cartsData.length === 0){
        return
    }else{
        gsap.to('.cartsWrap', { duration: 1, x: -200, opacity: 0, display: 'none' })
        validateWrap.classList.remove('d-none')
        gsap.from('.validateWrap', { duration: 1, x: 200, opacity: 0 }).delay(1.5)
        gsap.to('.validateWrap', { duration: 1, x: 0, opacity: 1 }).delay(1.5)
    }
    progressStep()
})
cartsList.addEventListener('click', deleteCarts)
deleteAll.addEventListener('click', deleteAllCarts)
sendOrderBtn.addEventListener('click', sendOrder)