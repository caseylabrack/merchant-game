let d3 = require("d3")
let _ = require("lodash")

const Earth = "Earth",
      Venus = "Venus"

let gameState = { view: "market", planet: Earth }

let markets =
[
  { planet: "Earth", goods:
    [
      { name: "twinkies", price: 2, initialQuantity: 3, quantity: 3 },
      { name: "compliments", price: 1, initialQuantity: 10, quantity: 10 },
      { name: "uranium", price: 8, initialQuantity: 3, quantity: 3 }
    ]
  },
  { planet: "Venus", goods:
    [
      { name: "twinkies", price: 2, initialQuantity: 3, quantity: 3 },
      { name: "compliments", price: 2, initialQuantity: 10, quantity: 10 },
      { name: "uranium", price: 9, initialQuantity: 3, quantity: 3 }
    ]
  }
]

let localMarket = markets.filter(z => z.planet===gameState.planet)[0].goods
localMarket.selected = true

let ship = {
  money: 4,
  mostMoney: 4,
  capacity: 4,
  cargo: []
}

updateMarket()
function updateMarket () {

  let marketRowsUpdating = d3.select("table#market")
    .selectAll("tr.marketItems")
    .data(localMarket)

  let marketRowsEntering = marketRowsUpdating
    .enter().append("tr").classed("marketItems", true)

  marketRowsEntering.append("td").classed("name", true)
  marketRowsEntering.append("td").classed("price", true)
  marketRowsEntering.append("td").classed("quantity", true)

  let marketRowsEnteringUpdating = marketRowsEntering.merge(marketRowsUpdating)
      .style("background-color", d => d.selected ? "yellow" : "white")

  marketRowsEnteringUpdating.select(".name").text(d => d.name)
  marketRowsEnteringUpdating.select(".price").text(d => d.price)
  marketRowsEnteringUpdating.select(".quantity").text(d => d.quantity)
}

function updateShipDisplay () {
  let shipInfo = []
  shipInfo.push(`you have ${ship.money}`)
  shipInfo.push(`in your cargo you have ${ship.cargo.map(z => z.tons + " tons of " + z.name).toString().replace(/,/g,", ")}`)

  let shipInfoRows = d3.select("#shipStatus").selectAll("p").data(shipInfo)

  let shipRowsEntering = shipInfoRows
    .enter()
      .append("p")

  let shipRowsEnterUpdate = shipRowsEntering.merge(shipInfoRows)
    .text(d => d)
}

updateShipVisual()
function updateShipVisual () {
  let data = d3.range(0,ship.money)
  let x = d3.scaleBand().domain(data).rangeRound([0, 200]).padding(.05)//.paddingInner(0.2).paddingOuter(.2)

  console.log(data)

  let update = d3.select("svg#moneyStatus")
    .selectAll("rect")
    .data(data)

  let enter = update
    .enter()
      .append("rect")

  update.merge(enter)
        .attr("x", d => x(d))
        .attr("y", 10)
        .attr("width", x.bandwidth())
        .attr("height", 10)
        .style("fill", "red")
}

updateShipCargo()
function updateShipCargo () {
  let data = d3.range(0,ship.capacity)//.map(z => ship.cargo[z] ? {hold: zfull: true} : {full:false})
  let x = d3.scaleBand().domain(data).rangeRound([0, 200]).padding(.05)

  let shipHolds = []
  ship.cargo.forEach(function(item){
    let t = item.tons
    while(t>0){
      t--
      shipHolds.push(true)
    }
  })

  let updating = d3.select("svg#cargoStatus")
    .selectAll("rect")
    .data(data)

  let entering = updating
    .enter()
      .append("rect")

  let updatingEntering = updating.merge(entering)
    .attr("x", d => x(d))
    .attr("y", 10)
    .attr("width", x.bandwidth())
    .attr("height", 10)
    .style("stroke", "red")
    .style("stroke-width", 1)
    .transition()
    .style("fill", d => shipHolds[d] ? "red" : "white")
}

document.addEventListener("keydown", (e) => {

  switch(e.key) {
    case " ":
    purchase(getSelectedItem(localMarket))
    break;

    case "ArrowUp":
    scrollTable(localMarket, -1)
    break;

    case "ArrowDown":
    scrollTable(localMarket, 1)
    break;

    case "Tab":
    //travel
    break;
  }

  function scrollTable (g, direction){
    let updatedIndex = _.clamp(g.indexOf(getSelectedItem(g)) + direction, 0, g.length-1) //index of new row
    g = g.map( (x,i) => { x.selected = i===updatedIndex; return x }) // set all other rows to false
  }

  updateMarket()
  updateShipVisual()
  updateShipCargo()
})

const compose = function(f, g) {
    return function(x) {
        return f(g(x));
    };
}

let getSelectedItem = g => g.filter(z => z.selected)[0]
let canPurchase = function(player,item){
  if(ship.capacity <= ship.cargo.reduce( (sum,val) => sum + val.tons, 0)) return false //ship is full
  if(ship.money < item.price) { return false } //can't afford it
  if(item.quantity <= 0) { return false } //none left
  return true
}
let purchase = function(item) {
  if(canPurchase(ship,item)){
    item.quantity -= 1
    if(ship.cargo.filter(z => z.name===item.name).length > 0){ //if already carrying this type of cargo
      ship.cargo.filter(z => z.name===item.name)[0].tons++
    } else {
      ship.cargo.push({name: item.name, tons: 1})
    }
    ship.money -= item.price
    return true
  } else { return false }
}
