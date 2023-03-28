import { setHeight } from "/utils.js"

/// Page Classes ///
class Page {
    constructor() {
        let pageLayout = '<div class="pageLayout"></div>'
        let div = document.createElement('div') //create parent element to prevent strage behaviour, dnt use DOMParser
        div.innerHTML = pageLayout
        this.page = div.firstChild
        this.testing = 'test'
    }

    async getHTML(url){
        let strPageCont = await fetch(url).then((res) => res.text())
        this.addToPage(strPageCont)
    }

    addToPage(HTMLString) {
        let parent = document.createElement('div')
        parent.innerHTML = HTMLString
        Array(...parent.children).forEach((x) => this.page.append(x))
    }

    render() {
        const main = document.getElementById('main')
        main.innerHTML = ''
        main.append(this.page)
    }
}

class FlashCard extends Page {
    constructor(id) {
        super()
        this.createPage()
        this.id = id
    }

    assignEventlistener() {
        const btn = this.page.querySelector('#btn')
        btn.addEventListener('click', () => alert('test click'))
    }

    async createPage() {
        await this.getHTML('/pages/flashcard.html')
        //this.assignEventlistener()
        setHeight('flashCardCont')

    }
}

/// ROUTING ///
const routes = {
    404: "/pages/404.html",
    "/": "/pages/home.html",
    "#dashboard": "/pages/dashboard.html",
    "#decks": "/pages/decks.html",
    "#test": FlashCard
}

const route = (event) => {
    event = event || window.event
    event.preventDefault()
    window.history.pushState({}, "", event.target.href)
    router()
}

const router = async () => {
    let path = window.location.hash
    if (path === '') {
        path = '/'
    }
    if (path !== '#test') {
        const route = routes[path] || routes[404]
        const html = await fetch(route).then((res) => res.text())
        const main = document.getElementById('main')
        main.innerHTML = html
    } else {
        activeComp = new routes[path]
        activeComp.render()
    }
}

var activeComp

const links = document.querySelectorAll('#nav-routes>a')
links.forEach((x) => {
    x.addEventListener('click', route)
})
window.addEventListener('popstate', router)
router()
/// ROUTING END ///

