import { MsSqlQuery } from './MsSqlQuery';
import mssql from '../mssql';

export class TestData extends MsSqlQuery<'testData'> {
  constructor() {
    super('testData');
  }

  /********************************************************************************************************************
   * selectTest
   * ******************************************************************************************************************/
  async selectTest() {
    console.log('::::: TestData::selectTest() :::::');

    console.log(await this.select(['id', 'name', 'email']));

    console.log(await this.select({ id_2: 'id', name_2: 'name', email_2: 'email' }));

    console.log(await this.select({ min_id: this.min('id'), max_id: this.max('id') }));

    console.log(await this.select((q) => q.columns('id', 'name')));

    console.log(
      await this.select((q) => [
        q.columns('id', 'name'),
        {
          email: q.t.email,
        },
      ])
    );

    console.log(await this.select().orderBy(this.desc('id')));

    console.log(await this.select().orderBy(this.asc('id')));

    console.log(await this.select(['id']).orderBy((q) => q.desc('id')));

    console.log(await this.select(['id']).orderBy((q) => q.asc('id')));

    console.log(await this.select(['id']).orderBy((q) => [q.asc('name'), q.asc('id')]));

    console.log(await this.select(['id']).orderBy((q) => mssql.desc(q.t.id)));
  }

  /********************************************************************************************************************
   * selectColumnsTest
   * ******************************************************************************************************************/
  async selectColumnsTest() {
    console.log('::::: TestData::selectColumnsTest() :::::');

    console.log(await this.select([this.columns('id', 'name', 'email')]));

    console.log(await this.select({ min_id: this.min('id'), max_id: this.max('id') }));
  }

  /********************************************************************************************************************
   * aliasSelectTest
   * ******************************************************************************************************************/
  async aliasSelectTest() {
    console.log('::::: TestData::aliasSelectTest() :::::');

    const td = mssql.a.testData('td');

    console.log(await this.select(td, { id: td.id, name: td.name }));

    console.log(await this.select(td, ['id', 'name']));

    console.log(await this.select(td, ['id', 'name as as_name', 'email AS as_email']));

    console.log(await this.select(td).orderBy(this.desc(td, 'id')));

    console.log(await this.select(td).orderBy(this.asc(td, 'id')));

    console.log(await this.select(td, ['id']).orderBy((q) => q.desc('id')));

    console.log(await this.select(td, ['id']).orderBy((q) => mssql.asc(q.t.id)));
  }

  /********************************************************************************************************************
   * selectTopTest
   * ******************************************************************************************************************/
  async selectTopTest() {
    console.log('::::: TestData::selectTopTest() :::::');

    console.log(await this.select().top(2));
  }

  /********************************************************************************************************************
   * subQueryTest
   * ******************************************************************************************************************/
  async subQueryTest() {
    console.log('::::: TestData::subQueryTest() :::::');

    {
      const builder = this.select(['id']).top(1).orderBy(this.desc('id'));

      console.log(await this.select({ id: 'id', sub_query_value: builder }).where(this.eq('id', 2)));

      console.log(await this.select().where(this.eq('id', builder)));

      const j = builder.as('j');
      console.log(
        await this.select([this.columns('name'), mssql.columns(j, 'id')]).innerJoin(j, mssql.eq(j.id, this.t.id))
      );
      console.log(await this.select().innerJoin(j, (q) => q.eq({ id: q.t.id })));

      const td = mssql.a.testData('td');
      const td2 = mssql.a.testData('td2');
      console.log(await this.select().where((q) => q.eq({ id: 1 })));
      console.log(
        await this.select([
          this.columns('id', 'name'),
          mssql.columns(td, 'id as td_id'),
          mssql.columns(td2, 'id as td2_id'),
        ])
          .innerJoin(td, mssql.eq(td.id, this.t.id))
          .innerJoin(td2, mssql.eq(td2.id, this.t.id))
          .where((q) => q.eq({ id: 2 }))
          .orderBy((q) => q.desc('name'))
      );
      console.log(await this.select().innerJoin(td, (q) => q.eq({ id: q.t.id })));
    }

    {
      const builder = this.select(['id', 'name']).top(1).orderBy(this.desc('id'));
      const j = builder.as('j');
      mssql.columns(j, 'id', 'name');
    }

    {
      const ac2 = mssql.a.testData('ac2');
      const appInfoBuilder = this.select({
        app_info: mssql.sqlString(''),
      }).where((q) =>
        q.and({
          eq: { id: ac2.id },
        })
      );
      console.log(await this.select(ac2, ['id', 'name', { app_info: appInfoBuilder }]));
    }
  }

  /********************************************************************************************************************
   * selectDistinctTest
   * ******************************************************************************************************************/
  async selectDistinctTest() {
    console.log(await this.selectDistinct(['name']));
  }

  /********************************************************************************************************************
   * findTest
   * ******************************************************************************************************************/
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

  /********************************************************************************************************************
   * conditionTest
   * ******************************************************************************************************************/
  async conditionTest() {
    console.log('::::: TestData::conditionTest() :::::');

    this.eq({ id: 1, name: 'name' });

    this.ne({ id: 1, name: 'name' });

    this.and({
      eq: { id: 1, name: 'name' },
      like: { name: '%name%' },
    });

    const oneRowBuilder = this.select(['id'])
      .top(1)
      .where((q) => q.lt({ id: 1 }));
    const multiRowBuilder = this.select(['id']).where((q) => q.lt({ id: 10 }));
    this.and({
      inArray: { id: multiRowBuilder },
      notInArray: { id: multiRowBuilder },
      between: { id: [oneRowBuilder, oneRowBuilder] },
    });
  }

  /********************************************************************************************************************
   * selectConditionTest
   * ******************************************************************************************************************/
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

    console.log(await this.select(['id']).where((q) => q.eq({ name: 'name' })));
    console.log(await this.select(['id']).where((q) => mssql.eq(q.t.name, 'name')));

    const td = mssql.a.testData('td');
    console.log(await this.select(td, ['id']).where((q) => q.eq({ name: 'name' })));
    console.log(await this.select(td, ['id']).where((q) => mssql.eq(q.t.name, 'name')));
  }

  /********************************************************************************************************************
   * addTest
   * ******************************************************************************************************************/
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

  /********************************************************************************************************************
   * addValuesTest
   * ******************************************************************************************************************/
  async addValuesTest() {
    console.log('::::: TestData::addValuesTest() :::::');

    const dt = new Date().toISOString();
    const addValues = this.addValues({
      name: `name ${dt}`,
      email: `email${dt}@test.com`,
    });
    console.log(await this.add(addValues));
  }

  /********************************************************************************************************************
   * addBySelectTest
   * ******************************************************************************************************************/
  async addBySelectTest() {
    console.log('::::: TestData::addBySelectTest() :::::');

    const builder = this.select({
      name: 'name',
      email: 'email',
      is_lock: this.t.is_lock,
    }).where(this.eq({ id: 2 }));
    console.log(await this.add(builder));
  }

  /********************************************************************************************************************
   * editTest
   * ******************************************************************************************************************/
  async editTest() {
    console.log('::::: TestData::editTest() :::::');

    console.log(await this.edit({ is_lock: true }, this.eq({ id: 1 })));
  }

  /********************************************************************************************************************
   * editByPrimaryKeyTest
   * ******************************************************************************************************************/
  async editByPrimaryKeyTest() {
    console.log('::::: TestData::editByPrimaryKeyTest() :::::');

    console.log(await this.editByPrimaryKey({ is_lock: true }, 1));
  }

  /********************************************************************************************************************
   * editValuesTest
   * ******************************************************************************************************************/
  async editValuesTest() {
    console.log('::::: TestData::editValuesTest() :::::');

    const editValues = this.editValues({
      is_lock: true,
    });
    console.log(await this.editByPrimaryKey(editValues, 1));
  }

  /********************************************************************************************************************
   * removeTest
   * ******************************************************************************************************************/
  async removeTest() {
    console.log('::::: TestData::removeTest() :::::');

    console.log(await this.remove(this.eq({ id: 1 })));
  }

  /********************************************************************************************************************
   * removeByPrimaryKeyTest
   * ******************************************************************************************************************/
  async removeByPrimaryKeyTest() {
    console.log('::::: TestData::removeByPrimaryKeyTest() :::::');

    console.log(await this.removeByPrimaryKey(1));
  }

  /********************************************************************************************************************
   * paginateTest
   * ******************************************************************************************************************/
  async paginateTest() {
    console.log('::::: TestData::paginateTest() :::::');

    const builder = this.select().orderBy(this.desc('id'));
    console.log(await mssql.paginate(builder, 1, 2));
    console.log(await mssql.paginate(builder, 2, 2));
  }
}

export const testData = new TestData();
