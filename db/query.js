const con = require("./connect");

// fetches all the cities from database
const getCities = () => {
  return new Promise(function(resolve, reject) {
    try {
      con.query("SELECT * FROM zip_place", function (err, results, fields) {
        if (err) throw err;
        resolve(results);
      });
    } catch (e) {
      console.log("Error");
    }
  });
}

// fetches all the featured vendors to be displayed in home page
const featuredVendors = (zipcode) => {
  return new Promise(function(resolve, reject) {
    try {
      con.query("SELECT * FROM vendor WHERE zipcode = ? LIMIT 5", [zipcode],  function (err, results, fields) {
        if (err) throw err;
        resolve(results);
      });
      } catch (e) {
      console.log("error");
    }
  });
}

// fetches the distinct dish categories served by any vendor
const distinctDish = (ven_ID) => {
  return new Promise(function(resolve, reject) {
    try {
      con.query("SELECT distinct category FROM dish WHERE ven_ID = ? ", [ven_ID], function (err, results2) {
        if (err) throw err;
        resolve(results2);
      });
    } catch (e) {
      console.log(e);
    }
  });
}

// fetches all the vendors of a place
const venProfileZip = (zipcode) => {
  return new Promise(function(resolve, reject) {
    try {
      con.query("SELECT * FROM vendor WHERE zipcode = ?", [zipcode],  async function (err, results, fields) {
        if (err) throw err;
        resolve(results);
      });
    } catch (e) {
      console.log(e);
    }
  });
}

// fetches all the vendors in a given city
const getVendors = async (zipcode) => {
    const vendors = [];
    try {
      const profile = [];
      const results = await venProfileZip(zipcode);
      for(let i=0; i<results.length; i++) {
        const profile = results[i];
        const types = await distinctDish(results[i].ID);
        vendors.push({profile: profile, types: types});
      }
      return vendors;
    } catch (e) {
      console.log("Error");
    }
}

// fetches all the featured dishes to be displayed in home page
const featuredDishes = (zipcode) => {
  return new Promise(function(resolve, reject) {
    try {
      con.query("SELECT * FROM dish WHERE ven_ID in (SELECT ID FROM vendor WHERE zipcode = ?) LIMIT 6", [zipcode], function (err, results, fields) {
        if (err) throw err;
        resolve(results);
      });
    } catch (e) {
      console.log("Error");
    }
  });
}

// fetches all the dishes of vendors in a given city
const getDishes = (zipcode) => {
  return new Promise(function(resolve, reject) {
    try {
      con.query("SELECT * FROM dish WHERE ven_ID in (SELECT ID FROM vendor WHERE zipcode = ?)", [zipcode], function (err, results, fields) {
        if (err) throw err;
        resolve(results);
      });
    } catch (e) {
      console.log("Error");
    }
  });
}

// fetches details of customer
const custProfile = (id) => {
  return new Promise(function(resolve, reject) {
    try {

    } catch (e) {
      console.log(e);
    }
    con.query("SELECT * FROM customer WHERE cust_ID = ?", [id], function(err, results) {
      if (err) throw err;
      resolve(results);
    });
  });
}

// fetches address of customer
const custAddress = (id) => {
  return new Promise(function(resolve, reject) {
    try {
      con.query("SELECT * FROM cust_address NATURAL JOIN zip_place WHERE cust_ID = ?", [id], function(err, results) {
        if (err) throw err;
        resolve(results);
      });
    } catch (e) {
      console.log(e);
    }
  });
}

const custOrderIDs = (id) => {
  return new Promise(function(resolve, reject) {
    try {
      con.query("SELECT * FROM `order` WHERE cust_ID = ?", [id], function(err, results) {
        if (err) throw err;
        resolve(results);
      });
    } catch (e) {
      console.log(e);
    }
  });
}

// fetches previous orders of customer
const custOrder = (order_ID) => {
  return new Promise(function(resolve, reject) {
    try {
      con.query("SELECT dish_name, no_of_items FROM `contains` NATURAL JOIN `dish` WHERE order_ID = ?;", [order_ID], function(err, results) {
        if (err) throw err;
        resolve(results);
      });
    } catch (e) {
      console.log(e);
    }
  });
}

// fetches bills of customer
const custBill = (id) => {
  return new Promise(function(resolve, reject) {
    try {
      con.query("SELECT * FROM bill WHERE bill_ID IN (SELECT bill_ID FROM  `order` WHERE cust_ID = ?)", [id], function(err, results) {
        if (err) throw err;
        resolve(results);
      });
    } catch (e) {
      console.log(e);
    }
  });
}

// fetches all the details of customer
const getCustomerProfile = async (id) => {
  const c = {};
  try {
    const results = await custProfile(id);
    c.cust_name = results[0].cust_name;
    c.email = results[0].email;
    c.cust_mobile = results[0].cust_contact;

    const results2 = await custAddress(id);
    const addresses = [];
    for(let i=0; i<results2.length; i++) {
        addresses.push({house_no: results2[i].house_no,
                                street: results2[i].street_name,
                                city: results2[i].city,
                                state: results2[i].state,
                                zip: results2[i].zipcode});
    }
    c.cust_address = addresses;

    const orders = [];
    const resultIDs = await custOrderIDs(id);
    const results4 = await custBill(id);
    for(let i=0; i<results4.length; i++) {
      const items = [];
      const results3 = await custOrder(resultIDs[i].order_ID);
      for(let j=0; j<results3.length; j++) {
          items.push({name : results3[j].dish_name,
                      qty: results3[j].no_of_items});
      }
      orders.push({itemList: items,
                  date: results4[i].time,
                  amt: results4[i].final_price,
                  mode: results4[i].mode_of_payment});
    }
    c.orders = orders;

    return c;
  } catch (e) {
    console.log("Profile Error");
  }
}

// get the details of the vendor
const venProfile = (id) => {
  return new Promise(function(resolve, reject) {
    try {
      con.query("SELECT * FROM vendor NATURAL JOIN zip_place WHERE ID = ?", [id], function(err, results) {
        if (err) throw err;
        resolve(results);
      });
    } catch (e) {
      console.log(e);
    }
  });
}

// get the dishes served by the vendor
const venDish = (id) => {
  return new Promise(function(resolve, reject) {
    try {
      con.query("SELECT * FROM dish WHERE ven_ID = ?", [id], function(err, results) {
        if (err) throw err;
        resolve(results);
      });
    } catch (e) {
      console.log(e);
    }
  });
}

// gets the reviews of the vendor
const venReviews = (id) => {
  return new Promise(function(resolve, reject) {
    try {
      con.query("SELECT * FROM reviews NATURAL JOIN customer WHERE ID = ?;", [id], function(err, results) {
        if (err) throw err;
        resolve(results);
      });
    } catch (e) {
      console.log(e);
    }
  });
}

// fetches all the details of vendor
const getVendorProfile = async (id) => {
  const v = {};
  try {
    const address = {}
    const results = await venProfile(id);
    v.name = results[0].name;
    v.owner = results[0].owner;
    v.mobile = results[0].contact_no;
    v.start_time = results[0].start_time;
    v.end_time = results[0].end_time;
    address.streetname = results[0].add_streetname;
    address.city = results[0].city;
    address.state = results[0].state;
    address.zipcode = results[0].zipcode;
    v.add = address;

    const dishes = [];
    const results2 = await venDish(id);
    for(let i=0; i<results2.length; i++) {
        dishes.push({name: results2[i].dish_name,
                                price: results2[i].price,
                                dish_ID: results2[i].dish_ID});
    }
    v.dishList = dishes;

    const reviews = [];
    const results3 = await venReviews(id);
    for(let i=0; i<results3.length; i++) {
        reviews.push({name : results3[i].cust_name,
                      rating: results3[i].rating,
                      comment: results3[i].comment});
    }
    v.reviews = reviews;

    return v;
  } catch (e) {
    console.log("Vendor Profile Error");
  }
}

// addes review of vendor given by any customer
const addReview = (ven_ID, cust_ID, stars, comment) => {
  try {
    con.query("INSERT INTO reviews VALUES (?, ?, ?, ?)", [ven_ID, cust_ID, stars, comment], function(err, results2) {
      if (err) throw err;
      console.log("Review added");
    });
  } catch (e) {
    console.log("Review add Error");
  }
}

// addes addresses of customer
const addAddress = (id, house_no, street_name, zipcode, city, state) => {
  try {
    con.query("SELECT zipcode FROM zip_place WHERE zipcode = ?", [zipcode], function (err, results) {
      if (err) throw err;
      if(results.length==0) {
        con.query("INSERT INTO zip_place VALUES (?, ?, ?)", [zipcode, city, state], function(err, results2) {
          if (err) throw err;
          console.log("Zip added");
        });
      }

      con.query("INSERT INTO cust_address (cust_ID, house_no, street_name, zipcode) VALUES (?, ?, ?, ?);", [id, house_no, street_name, zipcode], function(err, results3) {
        if (err) throw err;
        console.log("Address added");
      });

    });

  } catch (e) {
    console.log("Address Error");
  }
}

// get the items in the cart
const getCart = (id) => {
  return new Promise(function(resolve, reject) {
  try {
    con.query("SELECT * FROM `cart` NATURAL JOIN `dish` WHERE cust_ID = ?;", [id], function (err, results, fields) {
      if (err) throw err;
      resolve(results);
    });
  } catch (e) {
    console.log(e);
  }
  });
}

// add the items in the cart
const addCart = (id, dish_ID, qty) => {
  try {
    con.query("INSERT INTO `cart` VALUES (?,?,?);", [id, dish_ID, qty], function (err, results, fields) {
      if (err) throw err;
      console.log("Item added to cart");
    });
  } catch (e) {
    res.send("Item already added to cart");
    console.log(e);
  }
}

// delete item from the cart
const deleteCart = (id, dish_ID) => {
  try {
    con.query("DELETE FROM `cart` WHERE cust_ID = ? AND dish_ID = ?;", [id, dish_ID], function (err, results, fields) {
      if (err) throw err;
      console.log("Item deleted from cart");
    });
  } catch (e) {
    console.log(e);
  }
}

// added bill of the customer
const addBill = (time, mode, actual_price, tax, discount, final_price) => {
  try {
    con.query("INSERT INTO bill (`time`, `mode_of_payment`, `actual_price`, `tax`, `discount`, `final_price`) VALUES (?, ?, ?, ?, ?, ?);", [time, mode, actual_price, tax, discount, final_price], function (err, results, fields) {
      if (err) throw err;
      console.log("Bill added");
    });
  } catch (e) {
    console.log(e);
  }
}

// get the id of the bill added
const getBillID = () => {
  return new Promise(function(resolve, reject) {
    try {
      con.query("SELECT MAX(bill_ID) as bill_ID FROM `bill`", function (err, results, fields) {
        if (err) throw err;
        resolve(results);
      });
    } catch (e) {
      console.log(e);
    }
  });
}

// add the order of customer
const addOrder = (bill_ID, cust_ID) => {
  try {
    con.query("INSERT INTO `order` (`bill_ID`, `cust_ID`) VALUES (?, ?);", [bill_ID, cust_ID], function (err, results, fields) {
      if (err) throw err;
      console.log("Order added");
    });
  } catch (e) {
    console.log(e);
  }
}

// get the id of order added
const getOrderID = () => {
  return new Promise(function(resolve, reject) {
    try {
      con.query("SELECT MAX(order_ID) as order_ID FROM `order`", function (err, results, fields) {
        if (err) throw err;
        resolve(results);
      });
    } catch (e) {
      console.log(e);
    }
  });
}

// add dishes of order in contains table
const addOrderDishes = async(order_ID, cust_ID) => {
  try {
    const dishes = await getCart(cust_ID);
    for(let i=0; i<dishes.length; i++) {
      con.query("INSERT INTO `contains` (`order_ID`, `dish_ID`, `no_of_items`) VALUES (?, ?, ?);", [order_ID, dishes[i].dish_ID, dishes[i].no_of_items], function (err, results, fields) {
        if (err) throw err;
        console.log("Dish added in contains");
      });
    }
  } catch (e) {
    console.log(e);
  }
}

// removes all the items from the cart booking
const flushCart = (cust_ID) => {
  try {
    con.query("DELETE FROM `cart` WHERE cust_ID = ?", [cust_ID], function (err, results, fields) {
      if (err) throw err;
      console.log("Cart flushed");
    });
  } catch (e) {
    console.log(e);
  }
}

// update the quantity of item in the cart
const updateCart = (qty, cust_ID, dish_ID) => {
  try {
    con.query("UPDATE `cart` SET no_of_items = ? WHERE cust_ID = ? and dish_ID = ?", [qty, cust_ID, dish_ID], function (err, results, fields) {
      if (err) throw err;
      console.log("Cart updated");
    });
  } catch (e) {
    console.log(e);
  }
}

// perform all the functions to place the order
const placeOrder = async (cust_ID, time, mode, actual_price, tax, discount, final_price) => {
  try {
    await addBill(time, mode, actual_price, tax, discount, final_price);
    const results = await getBillID();
    await addOrder(results[0].bill_ID, cust_ID);
    const results2 = await getOrderID();
    await addOrderDishes(results2[0].order_ID, cust_ID);
    await flushCart(cust_ID);
  } catch (e) {
    console.log(e);
  }
}

module.exports = {getCities, getCustomerProfile, addAddress, featuredVendors, getVendors, getVendorProfile, featuredDishes, getDishes, getCart, addCart, deleteCart, placeOrder, updateCart, addReview};
