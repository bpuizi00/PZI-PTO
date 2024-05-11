// funkcija uglavnom sa sata labova za stvaranje PTO i fetchanje usera za popunit user container  
document.addEventListener('DOMContentLoaded', async function () {
    try {
        //ako je vec prijavljen, prikazuje main view i sakriva login view
        const emailCookie = getCookie("email");
        console.log(emailCookie);
        if(emailCookie !== null) {
            const pageView = document.querySelector("body > main");
            const signoutButton = document.querySelector("header button.sign-out");
            const singedInText = document.querySelector("header .username");
            const guestView =document.getElementById("guestView");
            pageView.classList.remove("inactive");
            signoutButton.classList.remove("inactive");
            signInButton.classList.add("inactive");
            singedInText.classList.remove("inactive");
            singedInText.innerText = `Signed in as ${emailCookie}`;
            guestView.classList.add("inactive");
        }

        const addPtoForm =document.getElementById("add-pto-form");

        addPtoForm.addEventListener("submit",handleAddPtoFormSubmit)

        const localStoragePtoData = localStorage.getItem("ptoData");

        if(localStoragePtoData){
            const storedPtoList = JSON.parse(localStoragePtoData);

            const ptoListContainer = document.getElementById("pto-list-container")

            storedPtoList.forEach((element) => {
                const ptoElement = createPtoElement(element.userId,new Date(element.startDate),new Date(element.endDate))
                ptoListContainer.appendChild(ptoElement)
            });
        }

        //get user
        const res = await fetch('https://jsonplaceholder.typicode.com/users/1');

        const user = await res.json();

        document.getElementById('user-id').querySelector('.content').innerText = user.id;
        document.getElementById('user-username').querySelector('.content').innerText = user.username;
        document.getElementById('user-full-name').querySelector('.content').innerText = user.name;
        document.getElementById('user-email').querySelector('.content').innerText = user.email;
        document.getElementById('user-phone').querySelector('.content').innerText = user.phone;
        document.getElementById('user-website').querySelector('.content').innerText = user.website;
    } catch (e) {
        console.error(e);
    }
});

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i=0;i < ca.length;i++) {
        let c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}


// funkcija za validaciju passworda
function validatePassword(password) {
    // (?=.*\d) - za broj, (?=.*[a-z]) za malo slovo, (?=.*[A-Z]) za veliko slovo, (?=.*[!@#$%^&*]) za specijalni znak, .{8,} da bude 8 ili više karaktera
   // const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/; 
    const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;
    return regex.test(password);
}

const signInButton = document.querySelector("body > header button.sign-in");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const loginForm = document.getElementById("login");

// dodaje event listener na sign in button, provjera tocnosti unosa, postavljanje vrijednosti u cookie i prikazivanje main viewa
signInButton.addEventListener("click", SignInForm);
function SignInForm(){
    const signoutButton = document.querySelector("header button.sign-out");
    const singedInText = document.querySelector("header .username");
    const pageView = document.querySelector("body > main");
    const guestView =document.getElementById("guestView");
    loginForm.style.visibility = "visible";
    emailInput.focus();
    emailInput.value = "";
    passwordInput.value = "";
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = emailInput.value;
        const password = passwordInput.value;
        const passwordValid = validatePassword(password);
        if (passwordValid) { //stavlja email i password u cookie sa trajanjem 7 dana
            const date = new Date();
            date.setTime(date.getTime() + (7*24*60*60*1000));
            const expires = "; expires=" + date.toUTCString();
            document.cookie = "email=" + email + expires + "; path=/";
            document.cookie = "password=" + password + expires + "; path=/";
            loginForm.style.visibility = "hidden";
            signoutButton.classList.remove("inactive");
            signInButton.classList.add("inactive");
            singedInText.classList.remove("inactive");
            singedInText.innerText = `Signed in as ${email}`;
            pageView.classList.remove("inactive");
            guestView.classList.add("inactive");
        } else {
            console.error('Invalid password');
        }
    });
}

//uklanja cookie na sign out i sakriva main view
document.querySelector("body > header button.sign-out").addEventListener("click", (e) => {
    const pageView = document.querySelector("body > main"); 
    const signoutButton = document.querySelector("header button.sign-out");
    const singedInText = document.querySelector("header .username");
    const guestView =document.getElementById("guestView");
    document.cookie = "email=; expires=Sat, 17 Feb 2024 00:00:00 UTC;";
    document.cookie = "password=; expires=Sat, 17 Feb 2024 00:00:00 UTC;";
    pageView.classList.add("inactive");
    signInButton.classList.remove("inactive");
    signoutButton.classList.add("inactive");
    singedInText.classList.add("inactive");
    guestView.classList.remove("inactive");
});

//zatvara login formu i brise unesene podatke da ne ostanu vidljivi sljedeći put
document.querySelector("#login button.exit").addEventListener("click", (e) => {
    const loginForm = document.getElementById("login");
    loginForm.style.visibility = "hidden";
    emailInput.value = "";
    passwordInput.value = "";
});

//funkcija za dodavanje PTO-a klikom na submit, uz provjere datuma, te spremanje u local storage
function handleAddPtoFormSubmit(event){
    event.preventDefault()
    
    const formData = new FormData(event.target)

    const startDateInp = formData.get("start-date-input");
    const endDateInp = formData.get("end-date-input");

    if(!startDateInp || !endDateInp){
        alert("Missing start or end date")
        return;
    }
    const startDate = new Date(startDateInp)
    const endDate = new Date(endDateInp)

    if(startDate >endDate){
        alert("Start date must not be greater than end date")
        return;
    }
     
    const newData = {
        userId: document.querySelector(".userDropdown").value,
        startDate: startDate.toDateString(),
        endDate: endDate.toISOString()
    }

    const localStoragePtoData = localStorage.getItem("ptoData")

    const storagePtoList = localStoragePtoData ? JSON.parse(localStoragePtoData): []

    storagePtoList.push(newData)

    const updatedPtoData = JSON.stringify(storagePtoList)


    localStorage.setItem("ptoData", updatedPtoData)

    const newPtoElement = createPtoElement(newData.userId,startDate,endDate);
    const selectedUser = document.querySelectorAll(".userDropdown")[1].value;
    if(selectedUser != 0 && selectedUser != newData.userId){
        newPtoElement.style.display = "none"; //ako je user razlicit od odabranog, sakriva se PTO element
    }
    const ptoListContainer = document.getElementById("pto-list-container")

    ptoListContainer.appendChild(newPtoElement)

}

//fetcha podatke svih korisnika i popunjava dropdown, te dodaje event listener na interakciju s dropdownom
fetch('https://jsonplaceholder.typicode.com/users')
  .then(response => response.json())
  .then(users => {
    const dropdown = document.querySelectorAll('.userDropdown');
    users.forEach(user => {
        for (let i = 0; i < dropdown.length; i++) {
            const option = document.createElement('option');
            option.value = user.id;
            option.text = user.name;
            dropdown[i].add(option);
        }
    });
    document.querySelectorAll(".userDropdown")[1].addEventListener("change", (e) => {
        FilterPto(users);
    });
  })
  .catch(error => console.error('Error:', error));

//funkcija za kreiranje PTO elementa sa svim potrebnim podacima, slikama i event listenerom za brisanje
function createPtoElement(userId,startDate,endDate){
    const ptoElement = document.createElement("div");
    ptoElement.classList.add("pto")
    const startDay = startDate.getDate();
    const startMonth = startDate.getMonth() + 1;
    const startYear = startDate.getFullYear();
    const currentDate = new Date(Date.now());

    //pocetni datumi za godisnja doba
    const spring = new Date(startYear, 2, 21); 
    const summer = new Date(startYear, 5, 21); 
    const autumn = new Date(startYear, 8, 23); 
    const winter = new Date(startYear, 11, 21); 
    console.log(startDate);
    console.log(endDate);
    console.log(currentDate);
    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    }
    if(startDate >= spring && startDate < summer){
        ptoElement.style.backgroundImage = "url('https://i.gyazo.com/28eb61b214d5e0c4262e257f5487042e.jpg')" // proljeće 
    } else if(startDate >= summer && startDate < autumn){
        ptoElement.style.backgroundImage = "url('images/summer.png')" // ljeto 
    } else if(startDate >= autumn && startDate < winter){
        ptoElement.style.backgroundImage = "url('https://i.gyazo.com/54d660a15eabd7c05cd7626f93cd6fcf.png')" //jesen
    } else {
        ptoElement.style.backgroundImage = "url('images/winter.png')"  //zima 
    }
    // postavljanje HTML-a za PTO element
    ptoElement.innerHTML = `
    <button> <i class="fa-solid fa-trash"></i> </button>
    <div> <h4>Pto Request</h4>
    <div class="pto-request-info"> 
        <div class ="pto-info userId">
            <label>User:</label>
            <label class="content">${userId}</label>
        </div>
        <div class ="pto-info start-date">
            <label>Start date:</label>
            <label class="content">${startDay}.${startMonth}.${startYear}.</label>
        </div>
        <div class ="pto-info end-date">
            <label>End date:</label>
            <label class="content">${endDate.toLocaleDateString("en-US",options)}</label>
        </div>

    </div>
    </div>
    
    `
    if(endDate < currentDate){
        ptoElement.classList.add("past"); //ako je datum prosao, dodaje se klasa za prosle PTO-ove
    }
    else if(currentDate<= endDate && startDate <= currentDate){
        ptoElement.classList.add("current"); //ako je trenutni datum unutar PTO-a dodaje se klasa za trenutne PTO-ove
    }
    else{
        ptoElement.classList.add("upcoming"); //ako je datum u buducnosti, dodaje se klasa za buduce PTO-ove
    }
    const deleteButton = ptoElement.querySelector("button");
    deleteButton.addEventListener("click",()=>{
        const IdRemove = ptoElement.querySelector(".userId .content").innerText;
        let ptoData = JSON.parse(localStorage.getItem('ptoData')) || [];
        ptoData = ptoData.filter((data) => {
            // ostavlja sve osim one koji su isti kao onaj koji se brise
            if(data.userId != IdRemove || data.startDate != startDate.toDateString().substring(0,15))
                return data;
        });
        localStorage.setItem('ptoData', JSON.stringify(ptoData));
        ptoElement.remove()
    })

    return ptoElement
}

//funkcija za filtriranje PTO-a prema odabranom korisniku i postavljanje user container podataka
function FilterPto(users){
    const userId = document.querySelectorAll(".userDropdown")[1].value;
    const ptoListContainer = document.getElementById("pto-list-container");
    const ptoList = ptoListContainer.querySelectorAll(".pto");
    const currentDate = new Date(Date.now()).toISOString().split("T")[0];
    let selectedUser= users.find(user => user.id == userId);
    document.getElementById("boxes").classList.remove("invisible");
    if(userId != "0"){
        document.getElementById('user-id').querySelector('.content').innerText = selectedUser.id;
        document.getElementById('user-username').querySelector('.content').innerText = selectedUser.username;
        document.getElementById('user-full-name').querySelector('.content').innerText = selectedUser.name;
        document.getElementById('user-email').querySelector('.content').innerText = selectedUser.email;
        document.getElementById('user-phone').querySelector('.content').innerText = selectedUser.phone;
        document.getElementById('user-website').querySelector('.content').innerText = selectedUser.website;
    }
    //postavljanje klase za svaki PTO element ovisno o datumu kako bi se preko njih pokazao okvir u boji
    ptoList.forEach((pto)=>{
        if(userId === "0"){ //ako je odabran "All" u dropdownu, prikazuje sve PTO elemente bez okvira 
            pto.style.display = "block";
        } else if(pto.querySelector(".userId .content").innerText === userId){ //ako se odabere neki user, filtira se po njemu i postavlja klasa za okvir ovisno o datumima
            pto.style.display = "block";
            const ptoDate = pto.querySelector(".start-date .content");
            const ptoEndDate = pto.querySelector(".end-date .content").innerText;
            let ptoEndDateFormatted = new Date(ptoEndDate).toLocaleDateString().split("T")[0];
            const ptoEndDatecomponents = ptoEndDateFormatted.split("/");
            for(let j = 0; j < 2; j++){
                if(ptoEndDatecomponents[j] < 10)
                    ptoEndDatecomponents[j] = "0" + ptoEndDatecomponents[j];
                }
            ptoEndDateFormatted = ptoEndDatecomponents[2] + "-" + ptoEndDatecomponents[0] + "-" + ptoEndDatecomponents[1];
            const ptoDatecomponents = ptoDate.innerText.split(".");
            for(let j = 0; j < 2; j++){
            if(ptoDatecomponents[j] < 10)
                ptoDatecomponents[j] = "0" + ptoDatecomponents[j];
            }
            const ptoDateFormatted = ptoDatecomponents[2] + "-" + ptoDatecomponents[1] + "-" + ptoDatecomponents[0];
            if(ptoEndDateFormatted < currentDate){
                pto.classList.add("past"); //ako je datum prosao, dodaje se klasa za prosle PTO-ove
            }
            else if(currentDate<= ptoEndDateFormatted && ptoDateFormatted <= currentDate){
                pto.classList.add("current"); //ako je trenutni datum unutar PTO-a dodaje se klasa za trenutne PTO-ove
            }
            else{
                pto.classList.add("upcoming"); //ako je datum u buducnosti, dodaje se klasa za buduce PTO-ove
            }
        } else {
            pto.style.display = "none"; //ako je user razlicit od odabranog, sakriva se PTO element
        }
    })

}

const startDateInput = document.getElementById('start-date-input');
const endDateInput = document.getElementById('end-date-input');
startDateInput.value = new Date().toISOString().split('T')[0];
endDateInput.value = new Date().toISOString().split('T')[0];

const startCalendar = document.getElementById('start-calendar');
const endCalendar = document.getElementById('end-calendar');

const startDateDays = startCalendar.querySelectorAll(".day");
const endDateDays = endCalendar.querySelectorAll(".day");

// kalendar dio koda gdje se puni kalendar sa danima mjeseca
function FillCalendar(dateInput, calendar, days) {
    const date = new Date(dateInput.value);
    const dateComponents = dateInput.value.split('-');
    //uzima se broj dana u mjesecu
    const daysInMonth = new Date(dateComponents[0], dateComponents[1], 0).getDate();
    const calendarMY = calendar.querySelector('.month-year');

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    calendarMY.textContent = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

    const firstDay = new Date(`${dateComponents[0]}-${dateComponents[1]}-01`);
    //uzima se na koji dan pada prvi dan mjeseca i na osnovu toga se puni kalendar
    const weekday = firstDay.getDay();
    for(let i=0;i<days.length;i++)
        days[i].textContent = '';
    switch(weekday) {
        case 0:
            for(let i=weekday + 6;i<daysInMonth + weekday + 6;i++)
                days[i].textContent = i - (weekday + 6) + 1;
            break;
        default:
            for(let i=weekday;i<daysInMonth + weekday;i++)
                days[i - 1].textContent = i - weekday + 1;
            break;
    }
}
FillCalendar(startDateInput, startCalendar, startDateDays);
FillCalendar(endDateInput, endCalendar, endDateDays);

let selectedStartDay = null;
//za odabir start dana u prvom kalendaru 
for(let i=0;i<startDateDays.length;i++) {
    startDateDays[i].addEventListener('click', function() {
        if(startDateDays[i].textContent !== '') {
            if(selectedStartDay !== null)
                selectedStartDay.classList.remove('selected');
            startDateDays[i].classList.add('selected');
            selectedStartDay = startDateDays[i];
            startDateInput.value = new Date(startDateInput.value.split('-')[0], startDateInput.value.split('-')[1] - 1, +startDateDays[i].textContent + 1).toISOString().split('T')[0];
        }
    });
}
let selectedEndDay = null;
//za odabir end dan u drugom kalendaru
for(let i=0;i<endDateDays.length;i++) {
    endDateDays[i].addEventListener('click', function() {
        if(endDateDays[i].textContent !== '') {
            if(selectedEndDay !== null)
                selectedEndDay.classList.remove('selected');
            endDateDays[i].classList.add('selected');
            selectedEndDay = endDateDays[i];
            endDateInput.value = new Date(endDateInput.value.split('-')[0], endDateInput.value.split('-')[1] - 1, +endDateDays[i].textContent + 1).toISOString().split('T')[0];
        }
    });
}
//event listener za promjenu mjeseca start kalendara unazad
startCalendar.querySelector('.prev-month').addEventListener("click", (e) => {
    console.log(startDateInput.value);
    const dateComponents = startDateInput.value.split('-');
    startDateInput.value = `${dateComponents[0]}-${dateComponents[1]}-02`;
    const date = new Date(startDateInput.value);
    date.setMonth(date.getMonth() - 1, 2);
    startDateInput.value = date.toISOString().split('T')[0];
    FillCalendar(startDateInput, startCalendar, startDateDays);
    highlightCurrentDate(date,startDateDays);
});

//event listener za promjenu mjeseca start kalendara unaprijed
startCalendar.querySelector('.next-month').addEventListener("click", (e) => {
    const dateComponents = startDateInput.value.split('-');
    startDateInput.value = `${dateComponents[0]}-${dateComponents[1]}-02`;
    const date = new Date(startDateInput.value);
    date.setMonth(date.getMonth() + 1, 2);
    startDateInput.value = date.toISOString().split('T')[0];
    FillCalendar(startDateInput, startCalendar, startDateDays);
    highlightCurrentDate(date,startDateDays);
});

//event listener za promjenu mjeseca end kalendara unazad
endCalendar.querySelector('.prev-month').addEventListener("click", (e) => {
    const dateComponents = endDateInput.value.split('-');
    endDateInput.value = `${dateComponents[0]}-${dateComponents[1]}-02`;
    const date = new Date(endDateInput.value);
    date.setMonth(date.getMonth() - 1, 2);
    endDateInput.value = date.toISOString().split('T')[0];
    FillCalendar(endDateInput, endCalendar, endDateDays);
    highlightCurrentDate(date,endDateDays);
});

//event listener za promjenu mjeseca end kalendara unaprijed
endCalendar.querySelector('.next-month').addEventListener("click", (e) => {
    const dateComponents = endDateInput.value.split('-');
    endDateInput.value = `${dateComponents[0]}-${dateComponents[1]}-02`;
    const date = new Date(endDateInput.value);
    date.setMonth(date.getMonth() + 1, 2);
    endDateInput.value = date.toISOString().split('T')[0];
    FillCalendar(endDateInput, endCalendar, endDateDays);
    highlightCurrentDate(date,endDateDays);
});

// za postavljanje klase za trenutni datum
const currentDate = new Date(Date.now());
const currentDateElementIndex = (() => {
    const startDateDays = startCalendar.querySelectorAll(".day");
    const endDateDays = endCalendar.querySelectorAll(".day");
    let i;
    for(i=0;i<startDateDays.length;i++){
        if(startDateDays[i].textContent === currentDate.getDate().toString()){
            startDateDays[i].classList.add("current-day");
            endDateDays[i].classList.add("current-day");
            break;
        }
    }
    return i;
})();

//funkcija za postavljanje klase za trenutni datum nakon promjene mjeseca
function highlightCurrentDate(date,CalendarDays){
    monthOnCalendar = date.getMonth();
    yearOnCalendar = date.getFullYear();    
    const currentDate = new Date(Date.now());
    currentMonth = currentDate.getMonth();
    currentYear = currentDate.getFullYear();

    if(monthOnCalendar === currentMonth && yearOnCalendar === currentYear){
        for(let i=0;i<CalendarDays.length;i++){
            if(CalendarDays[i].textContent === currentDate.getDate().toString()){
                CalendarDays[i].classList.add("current-day");
            }
        }
    }
    else{
        CalendarDays[currentDateElementIndex].classList.remove("current-day");
    }
}


