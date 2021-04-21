import { backendDomain } from '../../api/api.js'

const orderContent = document.querySelector('.js-orderContent');
const clearAllOrderBtn = document.querySelector('.clearAllOrder');
const chartBtn = document.querySelector('.js-chartBtn');
const chartTitle = document.querySelector('.chartTitle');

let orders = []

function init() {
    getOrder()
}
init()
async function getOrder() {
    // 取得訂單資料
    try {
        const getOrder = await backendDomain.get('/orders')
        let str = ''
        orders = getOrder.data.orders
        let productsTitle = ''
        let isPaid = ''
        orders.forEach((item) => {
            if(item.paid === true){
                isPaid = '已處理'
            }else if(item.paid === false){
                isPaid = '未處理'
            }
            item.products.forEach((item) => {
                productsTitle += `<p>${item.title} x${item.quantity}<p>`
            })
            const timeStamp = new Date(item.createdAt * 1000)
            const createTime = `${timeStamp.getFullYear()}/${timeStamp.getMonth() + 1}/${timeStamp.getDate()}`
            str += `
                <tr>
                    <td>${item.id}</td>
                    <td><span class="d-block">${item.user.name}</span> 0912345678</td>
                    <td>${item.user.address}</td>
                    <td>${item.user.email}</td>
                    <td>${productsTitle}</td>
                    <td>${createTime}</td>
                    <td><a href="javascript:;" id="isPaid" class="ispaid" data-id="${item.id}" data-status="${item.paid}">${isPaid}</a></td>
                    <td>
                        <button id="js-deleteBtn" class="btn btn-danger px-1" data-id="${item.id}">刪除</button>
                    </td>
                </tr>`
        })
        orderContent.innerHTML = str
        renderC3()
        // renderC3_Rank()
    } catch (error) {
        console.log(error);
    }
}
// 圖表類別
let chartType = 'a'
// 全產品類別營收比重
function renderC3() {
    const total = {}
    const newData = []
    switch (chartType) {
        case 'a':
            orders.forEach((item) => {
                item.products.forEach((product) => {
                    if(total[product.category] === undefined) {
                        total[product.category] = product.quantity * product.price
                    }else if(total[product.category] !== undefined) {
                        total[product.category] += product.quantity * product.price
                    }
                })
            })
            const categoryAry = Object.keys(total)
            categoryAry.forEach((item) => {
                let eachCategoryAry = []
                eachCategoryAry.push(item)
                eachCategoryAry.push(total[item])
                newData.push(eachCategoryAry)
            })
            break;
        case 'b':
            orders.forEach((item) => {
                item.products.forEach((product) => {
                    if(total[product.title] === undefined) {
                        total[product.title] = product.quantity * product.price
                    }else if(total[product.title] !== undefined) {
                        total[product.title] += product.quantity * product.price
                    }
                })
            })
            const productAry = Object.keys(total)
            productAry.forEach((item) => {
                let eachCategoryAry = []
                eachCategoryAry.push(item)
                eachCategoryAry.push(total[item])
                newData.push(eachCategoryAry)
            })
            // 商品總價排名
            newData.sort((a, b) =>{
                return b[1]-a[1]
            })
            // 選出其他品項
            if(newData.length > 3){
                console.log(newData);
                const otherData = newData.slice(3)
                const otherDataTotal = otherData.reduce((acc, cur) => {
                    return acc[1] + cur[1]
                })
                console.log(otherDataTotal);
                newData.splice(3, newData.length)
                newData.push(['其他', otherDataTotal])
            }
            break
        default:
            break;
    }
    let chart = c3.generate({
        bindto: '#chart',
        data: {
          columns: newData,
          type : 'pie',
        }
    });
}
function changeChart(){
    if(chartType === 'a'){
        chartType = 'b'
    }else if(chartType === 'b'){
        chartType = 'a'
    }
    renderC3()
    console.log(chartType);
}
// 刪除單一商品
async function event (e){
    e.preventDefault()
    const target = e.target.getAttribute('id')
    const id = e.target.getAttribute('data-id')
    let status = e.target.getAttribute('data-status')
    try{
        if(target === 'js-deleteBtn'){
            const deleteOrder = await backendDomain.delete(`/orders/${id}`)
        }
        if(target === 'isPaid'){
            if(status === 'true'){
                status = false
            } else if(status === 'false'){
                status = true
            }
            const deleteOrder = await backendDomain.put(`/orders`, {
                "data": {
                    "id": id,
                    "paid": status
                  }
            })
        }
        getOrder()
    }catch(error){
        console.log(error);
    }
}
// 清除所有訂單
async function clearAllOrder() {
    try {
        const deleteAll = await backendDomain.delete('/orders')
        getOrder()
    } catch (error) {
        console.log(error);
    }
}

orderContent.addEventListener('click', event)
clearAllOrderBtn.addEventListener('click', clearAllOrder)
chartBtn.addEventListener('click', changeChart)