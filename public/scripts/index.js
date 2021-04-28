// get selected city
const totalPrice = document.querySelector(".cart-page .cart-price .total-price");
const tax = document.querySelector(".cart-page .cart-price .tax");
const discount = document.querySelector(".cart-page .cart-price .discount");
const finalPrice = document.querySelector(".cart-page .cart-price .final-price");
const prices = document.querySelectorAll(".cart-page .cartdish-div .dishPrice");
const quantities = document.querySelectorAll(".cart-page .cartdish-div .qty");
const upArrow = document.querySelector(".cart-page .cartdish-div .qty");

function increaseQty(event, dish_ID) {
  const input = event.parentNode.previousElementSibling;
  input.value++;
  calTotalPrice();
  calTax();
  calDiscount();
  calFinalPrice();
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "/cart/update", false);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({
    dish_ID: dish_ID,
    qty: input.value
  }));
  window.location.reload();
}

function decreaseQty(event, dish_ID) {
  const input = event.parentNode.nextElementSibling;
  if(input.value>1) {
    input.value--;
  }
  calTotalPrice();
  calTax();
  calDiscount();
  calFinalPrice();
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "/cart/update", false);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({
    dish_ID: dish_ID,
    qty: input.value
  }));
  window.location.reload();
}

function calTotalPrice() {
  let sum = 0;
  for(let i=0; i<prices.length; i++) {
    sum = sum + parseInt((prices[i].innerText).substring(11))*(quantities[i].value);
  }
  totalPrice.innerText = "Rs. "+sum;
  return sum;
}

function calTax() {
  let sum = calTotalPrice();
  let rate = 5;
  let t = (sum * rate)/100;
  tax.innerText = "Rs. "+t+" @"+rate+"%";
  return t;
}

function calDiscount() {
  let tsum = calTotalPrice() + calTax();
  let dis = 4;
  let d = (tsum * dis)/100;
  discount.innerText = "Rs. "+d+" @"+dis+"% on taxed price";
  return d;
}

function calFinalPrice() {
  let fsum = calTotalPrice() + calTax() - calDiscount();
  finalPrice.innerText = "Rs. "+fsum;
  return fsum;
}

calTotalPrice();
calTax();
calDiscount();
calFinalPrice();

function addToCart(id) {
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "/cart/add", false);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({
    dish_ID: id
  }));
}

function deleteFromCart(id) {
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "/cart/delete", false);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({
    dish_ID: id
  }));
  window.location.reload();
}

function placeOrder() {
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "/cart/place-order", false);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({
    time: new Date().toISOString().slice(0, 19).replace('T', ' '),
    mode: "Cash on delivery",
    actual_price: calTotalPrice(),
    tax: calTax(),
    discount: calDiscount(),
    final_price: calFinalPrice()
  }));
  window.location.reload();
}
