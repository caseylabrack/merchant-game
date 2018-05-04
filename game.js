let d3 = require("d3")

const Earth = "Earth",
      Venus = "Venus"

let gameState = { view: "market", planet: Earth }
let markets =
[
  { planet: "Earth", goods:
    [
      { name: "twinkies", price: 100, quantity: 3},
      { name: "uranium", price: 200, quantity: 3}
    ]
  },
  { planet: "Venus", goods:
    [
      { name: "twinkies", price: 110, quantity: 3},
      { name: "uranium", price: 220, quantity: 3}
    ]
  }
]

let shipState = {
  capacity: 10,
  cargo: [
    { name: "socks", tons: 1 },
    { name: "zukes", tons: 2 }
  ]
}

let data = markets.filter(z => z.planet===gameState.planet)[0].goods

let marketRows = d3.select("table#market")
  .selectAll("tr.marketItems")
  .data(data)
  .enter()
  .append("tr").classed("marketItems", true)
    .on("click", () => console.log("click row!"))

marketRows
  .append("td")
    .text(d => d.name)

marketRows
  .append("td")
    .text(d => d.price)

marketRows
  .append("td")
    .text(d => d.quantity)

d3.select("#cargoStatus")
  .text( function (){
    let string = ""
    shipState.cargo.forEach( function (thing) {
      string += `${thing.tons} tons of ${thing.name}, `
    })
    return string
  })
