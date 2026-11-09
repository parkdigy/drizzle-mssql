import { MsSqlQuery } from './MsSqlQuery';
import mssql from '../mssql';

export class TestData extends MsSqlQuery<'testData'> {
  constructor() {
    super('testData');
  }

  async selectTest() {
    console.log('::::: TestData::selectTest() :::::');

    console.log(await this.select(['id', 'name', 'email']));

    console.log(await this.select({ id_2: 'id', name_2: 'name', email_2: 'email' }));

    console.log(await this.select({ min_id: this.min('id'), max_id: this.max('id') }));

    console.log(await this.select().orderBy(this.desc('id')));

    console.log(await this.select().orderBy(this.asc('id')));
  }

  async selectColumnsTest() {
    console.log('::::: TestData::selectColumnsTest() :::::');

    console.log(await this.select([this.columns('id', 'name', 'email')]));

    console.log(await this.select({ min_id: this.min('id'), max_id: this.max('id') }));
  }

  async aliasSelectTest() {
    console.log('::::: TestData::aliasSelectTest() :::::');

    const td = mssql.a.testData('td');

    console.log(await this.select(td, { id: td.id, name: td.name }));

    console.log(await this.select(td, ['id', 'name']));

    console.log(await this.select(td, ['id', 'name as as_name', 'email AS as_email']));

    console.log(await this.select(td).orderBy(this.desc(td, 'id')));

    console.log(await this.select(td).orderBy(this.asc(td, 'id')));
  }

  async selectTopTest() {
    console.log('::::: TestData::selectTopTest() :::::');

    console.log(await this.select().top(2));
  }

  async subQueryTest() {
    console.log('::::: TestData::subQueryTest() :::::');

    const builder = this.select(['id']).top(1).orderBy(this.desc('id'));

    console.log(await this.select({ id: 'id', sub_query_value: builder }).where(this.eq('id', 2)));

    console.log(await this.select().where(this.eq('id', builder)));
  }

  async findTest() {
    console.log('::::: TestData::findTest() :::::');

    console.log(await this.find(['id', 'name', 'email']));

    console.log(await this.find(['id', 'name', 'email'], this.eq({ id: 2 })));

    console.log(await this.find({ id_2: 'id', name_2: 'name', email_2: 'email' }));

    console.log(await this.find({ id_2: 'id', name_2: 'name', email_2: 'email' }, this.eq({ id: 2 })));

    console.log(await this.find({ min_id: this.min('id'), max_id: this.max('id') }));

    console.log(await this.findByPrimaryKey(['id', 'name', 'email'], 2));

    console.log(await this.findByPrimaryKey({ id_2: 'id' }, 2));

    console.log(await this.findByPrimaryKey({ min_id: this.min('id'), max_id: this.max('id') }, 2));
  }

  async conditionTest() {
    console.log('::::: TestData::conditionTest() :::::');

    this.eq({ id: 1, name: 'name' });

    this.ne({ id: 1, name: 'name' });
    this.and({
      eq: { id: 1 },
      like: { name: '%name%' },
    });
  }

  async selectConditionTest() {
    console.log('::::: TestData::selectConditionTest() :::::');

    console.log(await this.select().where(this.eq({ id: 1 })));

    console.log(
      await this.select().where(
        this.and({
          eq: { id: 1 },
          like: { name: '%name%' },
        })
      )
    );
  }

  async addTest() {
    console.log('::::: TestData::addTest() :::::');

    const dt = new Date().toISOString();
    console.log(
      await this.add({
        name: `name ${dt}`,
        email: `email${dt}@test.com`,
      })
    );
  }

  async addValuesTest() {
    console.log('::::: TestData::addValuesTest() :::::');

    const dt = new Date().toISOString();
    const addValues = this.addValues({
      name: `name ${dt}`,
      email: `email${dt}@test.com`,
    });
    console.log(await this.add(addValues));
  }

  async editTest() {
    console.log('::::: TestData::editTest() :::::');

    console.log(await this.edit({ is_lock: true }, this.eq({ id: 1 })));
  }

  async editByPrimaryKeyTest() {
    console.log('::::: TestData::editByPrimaryKeyTest() :::::');

    console.log(await this.editByPrimaryKey({ is_lock: true }, 1));
  }

  async editValuesTest() {
    console.log('::::: TestData::editValuesTest() :::::');

    const editValues = this.editValues({
      is_lock: true,
    });
    console.log(await this.editByPrimaryKey(editValues, 1));
  }

  async removeTest() {
    console.log('::::: TestData::removeTest() :::::');

    console.log(await this.remove(this.eq({ id: 1 })));
  }

  async removeByPrimaryKeyTest() {
    console.log('::::: TestData::removeByPrimaryKeyTest() :::::');

    console.log(await this.removeByPrimaryKey(1));
  }

  async paginateTest() {
    console.log('::::: TestData::paginateTest() :::::');

    const builder = this.select().orderBy(this.desc('id'));
    console.log(await mssql.paginate(builder, 1, 2));
    console.log(await mssql.paginate(builder, 2, 2));
  }
}

export const testData = new TestData();
