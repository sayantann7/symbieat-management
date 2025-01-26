
document.getElementById('updateStockBtn').addEventListener('click', () => {
  document.getElementById('inventoryForm').submit();
});

document.querySelectorAll('.qty-btn').forEach(button => {
  button.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      const quantityInput = document.querySelector(`input[name="quantity_${id}"]`);
      const changedInput = document.querySelector(`input[name="changed_${id}"]`);

      changedInput.value = 'true';
  });
});

document.querySelectorAll('.quantity').forEach(input => {
  input.addEventListener('input', function() {
      const id = this.getAttribute('data-id');
      const changedInput = document.querySelector(`input[name="changed_${id}"]`);
      changedInput.value = 'true';
  });
});


function formatTimeLeft(milliseconds) {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

async function fetchOrders() {
  const response = await fetch("/api/reservations");
  const orders = await response.json();
  return orders;
}

const totalReservations = await fetchOrders();
const ordersHeading = document.querySelector('.orders-heading');
if (totalReservations.length === 0) {
    ordersHeading.textContent = "";
} else {
    ordersHeading.textContent = "Active Orders";
}

async function initialOrderUpdate() {
    const ordersGrid = document.querySelector(".orders-grid");
    ordersGrid.innerHTML = "";
  
    let activeOrders = await fetchOrders();
  
    activeOrders.forEach((order) => {
  
      const orderCard = document.createElement("div");
      orderCard.className = "order-card";
  
      orderCard.innerHTML = `
      <div class="order-header">
          <span class="order-time"></span>
      </div>
      <div class="order-items">
          <div class="order-item">
              <img src="images/food.jpg" alt="Pizza">
              <div class="item-details">
                  <h4>${order.name}</h4>
                  <p>${order.quantity} pc for ${order.user.fullName}</p>
              </div>
              <span class="item-price">₹${order.quantity*order.price}</span>
          </div>
      </div>
      <div class="order-actions">
          <a href="/serve-order/${order._id}" style="text-decoration: none; color: inherit;">
            <button class="accept-btn">Mark as Served</button>
          </a>
          <a href="/cancel-order/${order._id}" style="text-decoration: none; color: inherit;">
            <button class="cancel-btn">Cancel Order</button>
          </a>
      </div>
      `;
  
      ordersGrid.appendChild(orderCard);
      
    });
  }

async function updateOrderTimers() {
  const now = Date.now();

  let activeOrders = await fetchOrders();

  activeOrders.forEach((order) => {
    const itemDate = new Date(order.date);
    const endTime = new Date(itemDate.getTime() + order.duration * 60 * 1000);
    const timeLeft = endTime - now;

    const orderTimeCard = document.querySelectorAll(".order-time");

    const timeLeftFormatted = formatTimeLeft(timeLeft);

    orderTimeCard.forEach((orderTime) => {
      orderTime.textContent = timeLeftFormatted;
    });
    
  });
}

// async function handleMarkAsReady(orderId) {
//   try {
//     // In real app, make API call here
//     activeOrders = activeOrders.filter((order) => order.id !== orderId);
//     updateOrderTimers();
//   } catch (error) {
//     console.error("Error marking order as ready:", error);
//   }
// }

// async function handleCancelOrder(orderId) {
//   try {
//     // In real app, make API call here
//     activeOrders = activeOrders.filter((order) => order.id !== orderId);
//     updateOrderTimers();
//   } catch (error) {
//     console.error("Error canceling order:", error);
//   }
// }

// Update timers every second
setInterval(updateOrderTimers, 1000);

// Initial update
initialOrderUpdate();
updateOrderTimers();

let plusBtns = document.querySelectorAll(".plus");
let minusBtns = document.querySelectorAll(".minus");
let quantities = document.querySelectorAll(".quantity");

plusBtns.forEach((plusBtn, index) => {
  plusBtn.addEventListener("click", () => {
    quantities[index].value = parseInt(quantities[index].value) + 1;
  });
});

minusBtns.forEach((minusBtn, index) => {
  minusBtn.addEventListener("click", () => {
    quantities[index].value = parseInt(quantities[index].value) - 1;
  });
});
