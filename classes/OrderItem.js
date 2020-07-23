export default class OrderItem {
  /**
   * @var {String}
   */
  field;

  /**
   * @var {String}
   */
  direction;

  /**
   * @constructor
   * @param {String} field
   * @param {String} direction
   */
  constructor(field, direction) {
    this.field = field;
    this.direction = direction;
  }
}
