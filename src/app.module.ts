import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PersonModule } from './person/person.module';
import { CitizenModule } from './citizen/citizen.module';
import { DriverModule } from './driver/driver.module';
import { BusModule } from './bus/bus.module';
import { GpsModule } from './gps/gps.module';
import { CompanyModule } from './company/company.module';
import { ShiftModule } from './shift/shift.module';
import { RouteModule } from './route/route.module';
import { WhereaboutsModule } from './whereabouts/whereabouts.module';
import { NodoModule } from './nodo/nodo.module';
import { ProgrammingModule } from './programming/programming.module';
import { TicketModule } from './ticket/ticket.module';
import { RecordModule } from './record/record.module';
import { AddressModule } from './address/address.module';
import { PaymentMethodModule } from './payment_method/payment_method.module';
import { CitizenPaymentMethodModule } from './citizen_payment_method/citizen_payment_method.module';
import { SecurityGuard } from './guards/security.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true, // SOLO para desarrollo
      }),
    }),

    PersonModule,

    CitizenModule,

    DriverModule,

    BusModule,

    GpsModule,

    CompanyModule,

    ShiftModule,

    RouteModule,

    WhereaboutsModule,

    NodoModule,

    ProgrammingModule,

    TicketModule,

    RecordModule,

    AddressModule,

    PaymentMethodModule,

    CitizenPaymentMethodModule,

    
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: SecurityGuard,
    },
  ],
})
export class AppModule {}