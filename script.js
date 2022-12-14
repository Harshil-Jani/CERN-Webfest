//Logic for Switching the visualization tabs without reloading the page
const openTab = (elem, tabName) => {
    const tabs = document.getElementsByClassName("visual-tabs");
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove("active");
    }
    const tabContent = document.getElementsByClassName("visual-tab-content");
    for (let i = 0; i < tabContent.length; i++) {
        tabContent[i].style.visibility = "hidden";
        tabContent[i].style.position = "absolute";
    }
    document.getElementById(tabName).style.position = "";
    document.getElementById(tabName).style.visibility = "visible";
    elem.classList.add("active")
}
document.getElementById("default-tab").click();