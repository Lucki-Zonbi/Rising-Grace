async function loadUsers(){

const token = localStorage.getItem("token");

try{

const response = await fetch("http://127.0.0.1:5000/api/admin/users",{
headers:{
Authorization:`Bearer ${token}`
}
});

const users = await response.json();

let html="";

users.forEach(user=>{

html += `
<p>
<strong>${user.name}</strong><br>
${user.email}<br>
Role: ${user.role}<br>
Status: ${user.locked ? "Locked" : "Active"}<br>

${user.locked ?
`<button onclick="unlockUser('${user._id}')">Unlock</button>`
: ""}

</p>
<hr>
`;

});

document.getElementById("usersList").innerHTML = html;

}
catch(error){

console.error("User load error",error);

}

}

async function unlockUser(userId){

const token = localStorage.getItem("token");

await fetch(`http://127.0.0.1:5000/api/admin/unlock/${userId}`,{

method:"PUT",

headers:{
Authorization:`Bearer ${token}`
}

});

loadUsers();

}
