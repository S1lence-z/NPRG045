export interface ICard<T = any> {
    id: number;
    title: string;
    content: T;
}

interface CardStripProps<T> {
    cards: ICard<T>[];
    CardComponent: React.FC<{ cardData: T }>;
}

const CardStrip = <T,>({ cards, CardComponent }: CardStripProps<T>) => {
    return (
        <div className="card-strip">
            {cards.map((card) => {
                return <CardComponent key={card.id} cardData={card.content} />;
            })}
        </div>
    );
};

export default CardStrip;
