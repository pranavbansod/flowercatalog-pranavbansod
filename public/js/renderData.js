let renderData = function() {
  let data = document.getElementById("data");
  let table = document.createElement("table");
  let tr = document.createElement("tr");
  let thDate = document.createElement("th");
  thDate.innerText = "Date";
  let thName = document.createElement("th");
  thName.innerText = "Name";
  let thComment = document.createElement("th");
  thComment.innerText = "Comment";
  tr.appendChild(thDate);
  tr.appendChild(thName);
  tr.appendChild(thComment);
  table.appendChild(tr);
  allGuestData.forEach(function(data){
    let tr = document.createElement("tr");
    let tdDate = document.createElement("td");
    tdDate.innerText = data['date'];
    let tdName = document.createElement("td");
    tdName.innerText = data['name'];
    let tdComment = document.createElement("td");
    tdComment.innerText = data['comment'];
    tr.appendChild(tdDate);
    tr.appendChild(tdName);
    tr.appendChild(tdComment);
    table.appendChild(tr);
  });
  data.appendChild(table);
}


window.onload = renderData
