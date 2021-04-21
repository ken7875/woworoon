import { domain } from '../api/api.js'

const productList = document.querySelector('.productList');
const selectCategory = document.querySelector('.selectCategory')

function init(){
    getProducts()
    getCarts()
}
init()
let products = []
async function getProducts () {
    try {
        const getProducts = await domain.get('/products');
        products = getProducts.data.products
        selectList()
        ProductList()
    } catch (error) {
        console.log(error);
    }
}
// 渲染產品列表
function render(item) {
    return `<li class="card p-0 border-0 mb-5 mr-3">
    <div class="p-0 position-relative">
        <h4 class="tag d-block bg-dark position-absolute px-5 py-2 text-white">新品</h4>
        <img src="${item.images}" alt="product img" class="w-100 h-100">
    </div>
    <div class="card-body p-0">
        <button class="js-addToCart bg-dark w-100 mb-2 text-white border-0" data-id="${item.id}" id="js-addToCart">加入購物車</button>
        <p class="nowrap mb-2 text-lg">${item.title}</p>
        <p class="text-lg"><del>NT$${item.origin_price}</del></p>
        <h3>NT$${item.price}</h3>
    </div>
</li>`
}
function ProductList() {
    let str = ''
    products.forEach((item) => {
        str += render(item)
    })
    productList.innerHTML = str
}
// render select option
function selectList(){
    const category = products.map((item) => {
        return item.category
    })
    const filterCategory = category.filter((item, i) => {
        return category.indexOf(item) === i
    })
    filterCategory.unshift('全部')
    let str = ''
    filterCategory.forEach((item) => {
        str += `
            <option value="${item}">${item}</option>
        `
    })   
    selectCategory.innerHTML = str
}
// 選擇渲染商品種類
function filterCategory() {
    let str = ''
    products.forEach((item) => {
        if(item.category === this.value){
            str += render(item)
        } else if (this.value === "全部") {
            str += render(item);
        }
    })
    productList.innerHTML = str
}
let cartsData = []
async function getCarts(){
    try {
        const getCarts = await domain.get('/carts')
        cartsData = getCarts.data.carts
    } catch (error) {
        console.log(error);
    }
}
async function addToCart(e) {
    e.preventDefault()
    let checkNum = 1
    try {
        alert('成功加入購物車')
        const cartClass = e.target.getAttribute('id')
        const id = e.target.getAttribute('data-id')
        if(cartClass !== 'js-addToCart'){
            return
        }
        cartsData.forEach((item) => {
            if(item.product.id === id){
                checkNum = item.quantity += 1
            }
        })
        console.log(checkNum);
        const addToCart = await domain.post('/carts', {
            "data": {
            "quantity": checkNum,
            "productId": `${id}`
            }
        });
        getCarts()
    } catch (error) {
        console.log(error);
    }
}

productList.addEventListener('click', addToCart)
selectCategory.addEventListener('change', filterCategory)