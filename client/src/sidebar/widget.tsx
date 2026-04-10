import { Deck } from "../app/App.tsx"
import './widget.css' 

type widget = {
    array: Array<Deck>
}

function Widget(prop: widget) {
    const sum = prop.array.reduce((acc, deck) => {
        return acc + (deck.flashcards.length - deck.cards_revisados);
    }, 0);

    return (
        <div id="widget">
            <h2>Revisão diária</h2>
            <p className="widget-count">
                Você tem <span className="widget-number">{sum}</span> card(s) para revisar hoje.
            </p>
        </div>
    )
}

export default Widget