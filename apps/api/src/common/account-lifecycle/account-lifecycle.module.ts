/** Regista a barreira de ciclo de vida e o interceptor global de mutações. */
import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { AccountLifecycleBarrierService } from "./account-lifecycle-barrier.service.js";
import { AccountLifecycleInterceptor } from "./account-lifecycle.interceptor.js";

@Module({
    providers: [
        AccountLifecycleBarrierService,
        {
            provide: APP_INTERCEPTOR,
            useClass: AccountLifecycleInterceptor,
        },
    ],
    exports: [AccountLifecycleBarrierService],
})
export class AccountLifecycleModule {}
