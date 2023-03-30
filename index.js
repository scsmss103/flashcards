import { setHeight } from "./utils.js"

/// Page Classes ///
class Page {
    constructor() {
        let pageLayout = '<div class="pageLayout"></div>'
        let div = document.createElement('div') //create parent element to prevent strage behaviour, dnt use DOMParser
        div.innerHTML = pageLayout
        this.page = div.firstChild
        this.testing = 'test'
    }

    async getHTML(url) {
        let strPageCont = await fetch(url).then((res) => res.text())
        this.addToPage(strPageCont)
    }

    addToPage(HTMLString) {
        let parent = document.createElement('div')
        parent.innerHTML = HTMLString
        Array(...parent.children).forEach((x) => this.page.append(x))
    }

    attachEventListener(arr, event, func) {
        arr.forEach((x) => {
            x.addEventListener(event, func)
        })
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
        this.#createPage()
        this.id = id
        this.dataHandler = new DataHandler
        this.dataHandler.getData('url')
        this.deckIdx = 2
    }

    #assignEventlistener() {
        //flash card flip button
        const btn = this.page.querySelectorAll('.flashCardBtn>button')
        const flipBtn = () => {
            let card = document.querySelector('.flashCard')
            if (Array(...card.classList).includes('rotate')) {
                card.classList.remove('rotate')
            } else {
                card.classList.add('rotate')
            }
        }
        this.attachEventListener(Array(...btn), 'click', flipBtn)
        //next card
        const nextCardBtns = this.page.querySelectorAll('.flashCardBtns>button')
        const nextBtn = () => {
            let card = document.querySelector('.flashCard')
            if (Array(...card.classList).includes('rotate')) {
                card.classList.remove('rotate')
            }
            this.deckIdx--
            setTimeout(()=>this.setFlashCardData(this.deckIdx),400)
        }
        this.attachEventListener(Array(...nextCardBtns), 'click', nextBtn)
    }

    setFlashCardData(idx) {
        const questions = document.querySelectorAll('.flashCardQuestion>p')
        const answer = document.querySelector('.flashCardAnswer>p')
        let questionTxt,answerTxt
        if (idx >= 0) {
            questionTxt = this.dataHandler.data[idx]['q']
            answerTxt = this.dataHandler.data[idx]['a']
        } else {
            questionTxt = 'Deck finished<br><button>click to learn more</button>'
            answerTxt = ''
        }
        Array(...questions).forEach((x) => {
            x.innerHTML = questionTxt
        })
        answer.innerHTML = answerTxt
    }

    async #createPage() {
        await this.getHTML('pages/flashcard.html')
        this.#assignEventlistener()
        setHeight('flashCardCont')
        this.setFlashCardData(this.deckIdx)
    }
}

class DataHandler {
    #findIdx(data, field, value) {
        let idx = false
        data.some((x, i) => {
            if (x[field] == value) {
                idx = i
                return true
            } else {
                return false
            }
        })
        return idx
    }

    getData(url) {
        this.data = [
            { id: 0, q: 'Whats the Capital of Switzerland?', a: 'Bern', bucket: 1 },
            { id: 2, q: 'Whats the Capital of Austria?', a: 'Vienna', bucket: 2 },
            { id: 1, q: 'Whats the Capital of Germany', a: 'Berlin', bucket: 3 },
            { id: 1, q: 'Whats the Capital of Russia', a: 'Moskow', bucket: 4 }
        ]
    }

    delete(id) {
        let idx = this.#findIdx(this.data, 'id', id)
        this.data.splice(idx, 1)
    }

    add(data) {
        this.data.push(data)
    }

    update(id, field, value) {
        let idx = this.#findIdx(this.data, 'id', id)
        this.data[idx][field] = value
    }
}

class StatsHandler extends DataHandler {
    constructor() {
        this.test = 'test'
        this.getData('url')
    }


}

/// ROUTING ///
const routes = {
    404: "pages/404.html",
    "/": "pages/home.html",
    "#/dashboard": "pages/dashboard.html",
    "#/decks": "pages/decks.html",
    "#/flashcard": FlashCard
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
    if (path !== '#/flashcard') {
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

