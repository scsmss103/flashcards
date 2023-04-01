import { randowmHex, setHeight } from "./utils.js"

/// Page Classes ///
class Page {
    constructor() {
        let pageLayout = '<div class="pageLayout"></div>'
        let div = document.createElement('div') //create parent element to prevent strage behaviour, dnt use DOMParser
        div.innerHTML = pageLayout
        this.page = div.firstChild
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
        this.id = id
        this.dataHandler = new DataHandler
        this.dataHandler.getData('flashcard')
        this.deckIdx = this.dataHandler.data.length - 1
        this.#createPage()
    }

    #assignEventlistener() {
        //edit btn
        const editBtn = this.page.querySelectorAll('.flashCardEditBtn')
        const editCard = () => {
            const icons = document.querySelectorAll('.flashCardEditBtn i')
            const q = document.querySelectorAll('.flashCardQuestion')
            const a = document.querySelector('.flashCardAnswer')
            const card = document.querySelector('.flashCard')

            if (!Array(...card.classList).includes('editing')) {
                card.classList.add('editing')
                let txtArea = document.createElement('textarea')
                txtArea.classList.add('flashCardTxtArea')
                //question
                const updQChg = (e) => {
                    const qUpd = document.querySelectorAll('.flashCardQuestion .flashCardTxtArea')
                    const val = e.currentTarget.value
                    Array(...qUpd).forEach((x) => {
                        x.value = val
                    })
                    this.dataHandler.update(this.deckIdx, 'q', val)
                }
                Array(...q).forEach((x) => {
                    const tmpElem = txtArea.cloneNode(true)
                    tmpElem.oninput = updQChg
                    tmpElem.value = this.dataHandler.data[this.deckIdx]['q']
                    x.firstElementChild.remove()
                    x.append(tmpElem)
                })
                //answer
                const updAChg = (e) => {
                    const val = e.currentTarget.value
                    this.dataHandler.update(this.deckIdx, 'a', val)
                }
                txtArea.value = this.dataHandler.data[this.deckIdx]['a']
                txtArea.oninput = updAChg
                a.firstElementChild.remove()
                a.append(txtArea)
                var newIcon = 'save'

            } else {
                card.classList.remove('editing')
                var newIcon = 'edit'
                const txtArea = document.querySelectorAll('.flashCardTxtArea')
                const p = document.createElement('p')
                //remove all txt area
                Array(...txtArea).forEach((x) => {
                    x.remove()
                })
                //add paragraphs
                Array(...q).forEach((x) => {
                    let tmpP = p.cloneNode(true)
                    tmpP.innerText = this.dataHandler.data[this.deckIdx]['q']
                    x.append(tmpP)
                })
                p.innerText = this.dataHandler.data[this.deckIdx]['a']
                a.append(p)
                console.log('thats new data: ', this.dataHandler.data)
            }

            Array(...icons).forEach((x) => {
                x.innerText = newIcon
            })
            //TODO: save handler
        }
        this.attachEventListener(editBtn, 'click', editCard)
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
        const nextBtn = (e) => {
            const bucket = parseInt(e.currentTarget.getAttribute('data-bucket'))
            let card = document.querySelector('.flashCard')
            if (Array(...card.classList).includes('rotate')) {
                card.classList.remove('rotate')
            }
            this.dataHandler.update(this.dataHandler.data[this.deckIdx].id, 'bucket', bucket)
            this.deckIdx--
            setTimeout(() => this.setFlashCardData(this.deckIdx), 400)
            console.log(this.dataHandler.data)
        }
        this.attachEventListener(Array(...nextCardBtns), 'click', nextBtn)
    }

    setFlashCardData(idx) {
        const questions = document.querySelectorAll('.flashCardQuestion>p')
        const answer = document.querySelector('.flashCardAnswer>p')
        let questionTxt, answerTxt
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
        console.log("thats type: ", FlashCard instanceof Page)
    }
}

class Upload extends Page {
    constructor() {
        super()
        this.#createpage()
        this.dataHandler = new DataHandler
        this.dataHandler.data = []
        this.columns = [
            { field: 'q', name: 'Question' },
            { field: 'a', name: 'Answer' }
        ]
    }

    #createToolbar() {
        const icons = [
            {
                icon: 'add_circle', toolTip: 'add', click: () => {
                    this.dataHandler.add({ id: randowmHex(), q: '', a: '', bucket: 1 })
                    this.tbl.rows = this.dataHandler.data
                    this.tbl.createRows()
                }
            },
            {
                icon: 'delete', toolTip: 'delete', click: () => { alert('delete') }
            }
        ]
        const div = document.createElement('div')
        const templIcon = document.createElement('i')

        div.classList.add('uplToolBar')
        div.style['grid-template-columns'] = `repeat(${icons.length},max-content)`

        templIcon.classList.add('material-symbols-outlined')

        icons.forEach((x) => {
            const tmpIcon = templIcon.cloneNode(true)
            const innerDiv = document.createElement('div')
            innerDiv.classList.add('tblToolBarIconWrapper')
            innerDiv.setAttribute('data-tooltip', x.toolTip)
            tmpIcon.innerText = x.icon
            tmpIcon.onclick = x.click
            innerDiv.append(tmpIcon)
            div.append(innerDiv)
        })
        this.toolbar = div
    }

    async #createpage() {
        await this.getHTML('pages/upload.html')
        setHeight('uploadCont')
        this.#createToolbar()
        this.tbl = new Table('.uploadCont', this.toolbar, this.columns, this.dataHandler.data, true, 'textarea')
        this.tbl.render()
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
        if (url === 'flashcard') {
            this.data = [
                { id: 0, q: 'Whats the Capital of Switzerland?', a: 'Bern', bucket: 1 },
                { id: 2, q: 'Whats the Capital of Austria?', a: 'Vienna', bucket: 2 },
                { id: 1, q: 'Whats the Capital of Germany', a: 'Berlin', bucket: 3 },
                { id: 3, q: 'Whats the Capital of Russia', a: 'Moskow', bucket: 4 }
            ]
        } else if (url === 'upload') {
            this.data = []
        }
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

class Table {
    constructor(target, toolbar, columns, rows, editable, inpType, headerClick, rowClick, headerCellComponent, rowCellComponent) {
        this.target = target
        this.tblId = randowmHex()
        if (editable) {
            this.editable = true
            this.inpType = inpType
        } else {
            this.editable = false
        }
        this.columns = columns
        this.rows = rows
        if (toolbar) {
            this.toolbar = toolbar
        } else {
            this.toolbar = false
        }
        this.promiseTbl = this.#createTbl()
        this.rowCellComponent = rowCellComponent
        this.headerCellComponent = headerCellComponent
        this.headerClick = headerClick
        this.rowClick = rowClick
    }

    #createCell(val, type, component) {
        let cell
        if (!component) {
            if (type === 'div') {
                cell = document.createElement('div')
            } else if (type === 'input') {
                cell = document.createElement('input')
            } else if (type === 'textarea') {
                cell = document.createElement('textarea')
            }
        } else {
            cell = component
        }
        cell.classList.add('tblCell')
        cell.innerHTML = val
        return cell
    }

    async getTableHTML() {
        let strTbl = await fetch('components/table.html').then((res) => res.text())
        await this.addToTbl(strTbl)
    }

    async addToTbl(HTMLString) {
        let tmpParent = document.createElement('div')
        tmpParent.innerHTML = HTMLString
        if (!this.tbl) {
            this.tbl = tmpParent.firstElementChild
        } else {
            //Array(...tmpParent.children).forEach((x) => this.tbl.append(x))
            for await (let x of Array(...tmpParent.children)) {
                this.tbl.append(x)
            }
        }
    }

    createToolBar() {
        if (this.toolbar) {
            let tmpToolBar = this.tbl.querySelector('.tblToolBar')
            tmpToolBar.append(this.toolbar)
        }
    }

    createHeader() {
        let header = this.tbl.querySelector(`.tblHeader`)
        header.style['grid-template-columns'] = `repeat(${this.columns.length},1fr)`
        header.style['grid-template-rows'] = `repeat(1,max-content)`
        this.columns.forEach((x) => {
            header.append(this.#createCell(x.name, 'div', this.headerCellComponent))
        })
    }

    createRows() {
        let rowsCont = this.tbl.querySelector(`.tblRows`)
        rowsCont.innerHTML = ''
        if (this.rows.length > 0) {
            rowsCont.style['grid-template-columns'] = `repeat(${this.columns.length},1fr)`
            rowsCont.style['grid-template-rows'] = `repeat(${this.rows.length},max-content)`
            const fields = this.columns.map((x) => x.field)
            this.rows.forEach((x) => {
                fields.forEach((y) => {
                    rowsCont.append(this.#createCell(x[y], this.inpType, this.rowCellComponent))
                })
            })
        } else {
            let emptyCell = this.#createCell('no data...', 'div')
            emptyCell.classList.remove('tblCell')
            emptyCell.style.padding = '9px'
            rowsCont.append(emptyCell)
        }
    }

    async #createTbl() {
        await this.getTableHTML()
        this.tbl.id = this.tblId
        this.createHeader()
        this.createRows()
        this.createToolBar()
    }

    async render() {
        let tgt = document.querySelector(this.target)
        tgt.innerHTML = ''
        await this.promiseTbl
        tgt.append(this.tbl)
    }
}

/// ROUTING ///
const routes = {
    404: "pages/404.html",
    "/": "pages/home.html",
    "#/dashboard": "pages/dashboard.html",
    "#/decks": "pages/decks.html",
    "#/flashcard": FlashCard,
    "#/upload": Upload
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
    if (typeof routes[path] === 'string' || !routes[path]) {
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

