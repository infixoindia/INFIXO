// Transport codes are mapped through the UI dictionary, never printed to visitors.
export async function getJoinSession() {
 const response = await fetch('/api/join', {cache:'no-store'});
 if (!response.ok) throw new Error('session');
 return response.json();
}
export async function sendLead(payload) {
 const response = await fetch('/api/join', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
 if (!response.ok) throw new Error(response.status===429?'rate':'send');
 return response.json();
}
