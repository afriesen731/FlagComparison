export class Flag {
    /**
     * @param {string} flag - The URL of the flag image.
     * @param {string} country - The name of the country.
     * @param {number} score - The ranking score of the flag.
     */
    constructor(flag, country, score) {
      this.flag = flag;
      this.country = country;
      this.score = score;
    }
  
    /**
     * Creates a Flag instance from Firestore data.
     * @param {Object} data - Firestore flag data.
     * @returns {Flag}
     */
    static fromFirestore(data) {
      return new Flag(data.flag, data.country, data.score);
    }
}