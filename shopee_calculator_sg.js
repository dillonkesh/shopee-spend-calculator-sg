var total = 0;
var order = 0;
var csvContent = "data:text/csv;charset=utf-8,Order Number,Price,Item Name,Date\n"; // CSV header

function calculate(next) {
    var opts = {
        method: 'GET',
        headers: {}
    };
    fetch('https://shopee.sg/api/v4/order/get_order_list?limit=5&list_type=3&offset=' + next, opts).then(function (response) {
        return response.json();
    })
        .then(function (body) {
            var next_offset = body.data.next_offset;
            if (next_offset >= 0) {
                for (let [key, value] of Object.entries(body.data.details_list)) {
                    var total_temp = value.info_card.final_total / 100000;
                    total += total_temp;
                    order++;

                    // convert unix timestamp to human-readable date
                    let date = new Date(value.shipping.tracking_info.ctime * 1000);
                    let formattedDate = date.toLocaleDateString();

                    // shorten item name to a maximum of six words
                    let itemName = value.info_card.order_list_cards[0].product_info.item_groups[0].items[0].name;
                    let shortItemName = itemName.split(' ').slice(0, 6).join(' ');

                    // add to CSV content
                    csvContent += order + "," + total_temp + "," + shortItemName.replace(",", "") + "," + formattedDate + "\n";

                    console.log(order + ":", "SGD " + total_temp + " - ", shortItemName + " Date: " + formattedDate);
                }
                calculate(next_offset);
            } else {
                console.log('Calculation completed!');
                console.log('GRAND TOTAL: SGD ' + Math.round(total * 100) / 100);

                // Create a link to download CSV content
                var encodedUri = encodeURI(csvContent);
                var link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", "shopee_orders.csv");
                document.body.appendChild(link);
                link.click();
            }
        });
}

calculate(0);
