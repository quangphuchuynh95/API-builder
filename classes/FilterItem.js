export default class FilterItem {
  /**
   * @var {String}
   */
  field;

  /**
   * @var {String}
   */
  op;

  /**
   * @var {String}
   */
  value;

  /**
   * @constructor
   * @param {String} field
   * @param {String} op
   * @param {String} value
   */
  constructor(field, op, value) {
    this.field = field;
    this.op = op;
    this.value = value;
  }
}
