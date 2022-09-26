import React from "react";
import styles from "../styles/Product.module.css";
import IPFSDownload from './IpfsDownload';

export default function Product({ product }) {
    const { id, name, price, description, image_url } = product;
    
    return (
        <div className={styles.product_container}>
            <div>
                <img className={styles.product_image}src={image_url} alt={name} />
            </div>

            <div className={styles.product_details}>
                <div className={styles.product_text}>
                    <div className={styles.product_title}>{name}</div>
                    <div className={styles.product_description}>{description}</div>
                </div>
            

            <div className={styles.product_action}>
                <div className={styles.product_price}>{price} USDC</div>
                {/* hardcoding these for now, we'll fetch the hash from the API later*/}
                <IPFSDownload filename="giphy.gif" hash="QmR6cH9S9cA8MpzQdFAhFmj3iAfv2yAUSyHjd7ohnJbiN9" cta="Download Emojis" />
            </div>
            </div>
        </div>
    )
}